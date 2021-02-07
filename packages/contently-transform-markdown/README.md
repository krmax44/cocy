# Contently Transform Markdown

Uses [Remark](https://github.com/remarkjs/remark) to transform your Markdown content.

## Usage

```ts
import ContentlyTransformMarkdown from 'contently-transform-markdown';

contently.use(ContentlyTransformMarkdown, options?);
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

## Asset resolving

TODO: explain it

## Built-in Remark plugins

By default, the following plugins are loaded, which you can modify using hooks as shown above:

- `html`: transforms Markdown to HTML
- `frontmatter`: parses YAML frontmatter
- `extract`: adds frontmatter data to the vfile
- [`assetResolver`](https://github.com/krmax44/contently/blob/main/packages/contently-transform-markdown/src/plugins/assetResolver.ts): custom plugin, allows you to hook into asset loading (see above)
- [`excerptGenerator`](https://github.com/krmax44/contently/blob/main/packages/contently-transform-markdown/src/excerptGenerator.ts): also custom, adds an excerpt to the result's attributes, which is either the frontmatter value of `excerpt`, all paragraphs before a `<!-- more -->` tag or the first paragraph of text (in that order).
