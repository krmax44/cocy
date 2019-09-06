# Contently Transform Markdown

Uses [Remark](https://github.com/remarkjs/remark) to transform your Markdown content.

## Usage

```js
const ContentlyTransformMarkdown = require('contently-transform-markdown');
contentlyInstance.use(ContentlyTransformMarkdown, options);
```

## Options

```ts
interface Options {
	/**
	 * @name plugins
	 * @description An array of Remark plugins.
	 * @default 'html,frontmatter,extract-frontmatter'
	 */
	plugins: Array<{ plugin: any; options?: any }>;
}
```
