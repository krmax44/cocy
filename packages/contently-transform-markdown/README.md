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

## Hooks

```ts
const md = contentlyInstance.plugins.transformMarkdown;
md.on('beforeAssetAdd', url => {
	// handle the asset, e.g. require with webpack
	// applies to Markdown and Frontmatter assets

	if (!url.startsWith('http')) {
		return require(url);
	}
});

md.on('beforePlugins', plugins => {
	plugins.push({
		plugin: myRemarkPlugin,
		options: { addedViaHook: true }
	});

	return plugins;
});
```
