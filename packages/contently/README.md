# Contently

The main Contently package.

## Usage

```ts
const contently = new Contently(options?);
```

## Options

See [`ContentlyOptions.ts`](./src/types/ContentlyOptions.ts).

## API

### `contently.use()`

```ts
contently.use(plugin, ...options?)
```

The plugin function will be invoked, allowing it to register hooks on the instance. The `contently` instance will be passed as the first parameter, followed by all specified options.

### `contently.find()`

Search for files and add them. Promise is fulfilled, once all files have been found and transformed by registered plugins.

### `contently.resolveAsset()`

```ts
contently.resolveAsset(asset, file, key?)
```

Resolve an asset using the asset resolver. If a key is specified, it will be added to the file's asset map and can be retrieved by using `file.assets.get(key)`. See Assets below for more.

### `contently.startWatcher()`

Start watching for file-system changes.

### `contently.stopWatcher()`

Stop watching for file-system changes.

## Events

You can hook into events on the instance. See the [Houk API docs](https://github.com/krmax44/houk#api) for more info on event listeners.

```ts
contently.on('fileAdded', (file: ContentlyFile) => {
	// we got a new file!
	console.log(file.slug);
});
```

| Event         | Parameters                                             | Description                                       |
| ------------- | ------------------------------------------------------ | ------------------------------------------------- |
| `fileAdded`   | `ContentlyFile`                                        | A new file was added.                             |
| `fileRemoved` | `ContentlyFile`                                        | A file was removed.                               |
| `fileUpdated` | `ContentlyFile`                                        | A file's content was changed.                     |
| `fileChanged` | `ContentlyFile`                                        | Any of the upper events occured to a file.        |
| `assetAdded`  | `ContentlyAsset`, `ContentlyFile`, `ContentlyAssetKey` | A new asset was added. See Assets below for more. |

## Assets

Allowing files to reference assets is often a basic requirement for content-based sites. For example, you might have a blog post like this in Markdown format:

```md
I went to Hamburg last summer:

![Proof](./hamburg.jpg)
```

Let's use the image tag as an example. By default, the file URLs will be kept, resulting in `<img src="./hamburg.jpg">`. Depending on your environment, this might not be desirable. To transform the file URLs, you can listen for `assetAdded` events:

```js
import path from 'path';

contently.on('assetAdded', async (resolve, asset, file) => {
	// here, asset is "./hamburg.jpg"
	// file is the Contently File object

	if (asset.startsWith('./')) {
		// it's a relative file path!
		// use the file's path as a base

		const absolute = path.join(file.path, '..', asset);

		// in this example, we might want to use an image cdn
		const url = await myCdn.upload(absolute);

		// url might be https://cdn.photos/hamburg.jpg
		resolve(url);
	}
});
```

This would result in `<img src="https://cdn.photos/hamburg.jpg">`.
