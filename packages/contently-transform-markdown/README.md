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

## Built-in Remark plugins

By default, the following plugins are loaded, which you can modify using hooks as shown above:

- `html`: transforms Markdown to HTML
- `frontmatter`: parses YAML frontmatter
- `extract`: adds frontmatter data to the vfile
- [`assetResolver`](https://github.com/krmax44/contently/blob/master/packages/contently-transform-markdown/src/plugins/assetResolver.ts): custom plugin, allows you to hook into asset loading (see above)
- [`excerptGenerator`](https://github.com/krmax44/contently/blob/master/packages/contently-transform-markdown/src/excerptGenerator.ts): also custom, adds an excerpt to the result's attributes, which is either the frontmatter value of `excerpt`, all paragraphs before a `<!-- more -->` tag or the first paragraph of text (in that order).
