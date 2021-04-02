# Cocy

The main Cocy package.

## Usage

```ts
const cocy = new Cocy(options?);
```

## Options

See [`CocyOptions.ts`](./src/types/CocyOptions.ts).

## Files

Files are stored as a map at `cocy.files`. You can for example get a file by its absolute path using `cocy.files.get(absolutePath)`.

The properties of each file object are described [here](./src/CocyFile.ts).

```ts
// it's a map - don't forget `values`
for (const file of cocy.files.values()) {
	console.log(file.attributes.title);
}
```

## Methods

### `cocy.use()`

```ts
cocy.use(plugin, ...options?)
```

The plugin function will be invoked, allowing it to register hooks on the instance. The `cocy` instance will be passed as the first parameter, followed by all specified options.

### `cocy.find()`

Search for files and add them. Promise is fulfilled, once all files have been found and transformed by registered plugins.

### `cocy.resolveAsset()`

```ts
cocy.resolveAsset(asset, file, key?)
```

Resolve an asset using the asset resolver. If a key is specified, it will be added to the file's asset map and can be retrieved by using `file.assets.get(key)`. See Assets below for more.

### `cocy.startWatcher()`

Start watching for file-system changes.

### `cocy.stopWatcher()`

Stop watching for file-system changes.

## Events

You can hook into events on the instance. See the [Houk API docs](https://github.com/krmax44/houk#api) for more info on event listeners.

```ts
cocy.on('fileAdded', (file: CocyFile) => {
	// we got a new file!
	console.log(file.slug);
});
```

| Event         | Parameters                              | Description                                       |
| ------------- | --------------------------------------- | ------------------------------------------------- |
| `fileAdded`   | `CocyFile`                              | A new file was added.                             |
| `fileRemoved` | `CocyFile`                              | A file was removed.                               |
| `fileUpdated` | `CocyFile`                              | A file's content was changed.                     |
| `fileChanged` | `CocyFile`                              | Any of the upper events occured to a file.        |
| `assetAdded`  | `CocyAsset`, `CocyFile`, `CocyAssetKey` | A new asset was added. See Assets below for more. |

## Assets

Allowing files to reference assets is often a basic requirement for content-based sites. For example, you might have a blog post like this in Markdown format:

```md
I went to Hamburg last summer:

![Proof](./hamburg.jpg)
```

Let's use the image tag as an example. By default, the file URLs will be kept, resulting in `<img src="./hamburg.jpg">`. Depending on your environment, this might not be desirable. To transform the file URLs, you can listen for `assetAdded` events:

```js
import path from 'path';

cocy.on('assetAdded', async (resolve, asset, file) => {
	// here, asset is "./hamburg.jpg"
	// file is the Cocy File object

	if (asset.startsWith('./')) {
		// it's a relative file path!
		// use the file's path as a base

		const absolute = path.join(file.path.absolute, '..', asset);

		// in this example, we might want to use an image cdn
		const url = await myCdn.upload(absolute);

		// url might be https://cdn.photos/hamburg.jpg
		resolve(url);
	}
});
```

This would result in `<img src="https://cdn.photos/hamburg.jpg">`.
