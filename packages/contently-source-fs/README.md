# Contently Source Filesystem

Sources results from the local filesystem.

## Usage

```js
const ContentlySourceFs = require('contently-source-fs');
contentlyInstance.use(ContentlySourceFs, options);
```

## Options

This plugin uses [Globby](https://github.com/sindresorhus/globby) under the hood, which means you can all of its and [fast-glob](https://github.com/mrmlnc/fast-glob)'s options.

```ts
interface Options extends GlobbyOptions {
	/**
	 * @name patterns
	 * @description One or multiple glob patterns
	 * @default "['*.md', '*.markdown', '!.*', '!_*']"
	 */
	patterns: string | string[];
}
```
