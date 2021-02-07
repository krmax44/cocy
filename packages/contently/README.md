# Contently

The main Contently package.

## Usage

```ts
const contently = new Contently(options?);
```

## Options

```ts
export interface ContentlyOptions {
	/**
	 * The current working directory.
	 * @name cwd
	 * @default process.cwd()
	 */
	cwd: string;

	/**
	 * Watch files and rebuild on change
	 * @name watch
	 * @default "process.env.NODE_ENV === 'development'"
	 */
	watch: boolean;

	/**
	 * A function that slugifies a given input.
	 * @name slugify
	 * @default slugo
	 */
	slugify: (input: string) => string;

	/**
	 * Glob patterns for files
	 * @name patterns
	 * @default "['*.md', '*.markdown', '*.mdwn', '!.*', '!_*']"
	 */
	patterns: string[];
}
```

## API

### `contently.use`

```ts
contently.use(plugin, options?)
```

The plugin function will be invoked, allowing it to register hooks on the instance.

### `contently.find()`

Search for files and add them. Returns a promise.

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
