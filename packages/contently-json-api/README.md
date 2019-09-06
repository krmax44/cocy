# Contently JSON API

Generates static JSON files.

## Usage

```js
const ContentlyJsonApi = require('contently-json-api');
contentlyInstance.use(contentlyJsonApi, options);
```

## Options

```ts
interface Options {
	/**
	 * @name output
	 * @description Output path relative to cwd.
	 * @default content/
	 */
	output: string;

	/**
	 * @name transformer
	 * @description A custom transformer function, that given with the results generates a file tree.
	 */
	transformer: (
		instance: Contently,
		options: Options
	) => FileTree | Promise<FileTree>;
}
```
