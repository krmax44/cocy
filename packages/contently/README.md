# Contently

The main Contently package.

## Usage

```ts
const contently = new Contently(options?);
```

## Options

See [`ContentlyOptions.ts`](./src/types/ContentlyOptions.ts).

## API

### `contently.use`

```ts
contently.use(plugin, options?)
```

The plugin function will be invoked, allowing it to register hooks on the instance.

### `contently.find()`

Search for files and add them. Promise is fulfilled, once all files have been found and transformed by registered plugins.

## Events

You can hook into events on the instance.

```ts
contently.on('fileAdded', (file: ContentlyFile) => {
	// we got a new file!
	console.log(file.slug);
});
```

| Event         | Parameters      | Description                                |
| ------------- | --------------- | ------------------------------------------ |
| `fileAdded`   | `ContentlyFile` | A new file was added.                      |
| `fileRemoved` | `ContentlyFile` | A file was removed.                        |
| `fileUpdated` | `ContentlyFile` | A file's content was changed.              |
| `fileChanged` | `ContentlyFile` | Any of the upper events occured to a file. |
