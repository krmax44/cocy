# Cocy Transform Markdown

Uses [Remark](https://github.com/remarkjs/remark) to transform your Markdown content to HTML.

## Usage

```ts
import md from '@cocy/transform-md';

cocy.use(md, options?);
```

## Options

```ts
interface Options {
	/**
	 * If true, generates an excerpt.
	 * @name generateExcerpt
	 * @default true
	 */
	generateExcerpt?: boolean;

	/**
	 * @name plugins
	 * @description An array of Remark plugins.
	 * @default 'html,frontmatter,extract-frontmatter'
	 */
	plugins: Array<{ plugin: any; options?: any }>;
}
```

## Frontmatter assets

You can load assets in frontmatter by using the `assets` key:

```yaml
---
title: Hello!
assets:
	thumb: ./my-photo.jpg
---
```

On the `CocyFile` object, you can retrieve the asset using `file.assets.get('thumb')`. Read more about assets with Cocy [here](https://github.com/krmax44/cocy/tree/main/packages/cocy#assets). Inline image assets (`![]()`) work as well.

## Built-in Remark plugins

By default, the following plugins are loaded, which you can modify using hooks as shown above:

- `html`: transforms Markdown to HTML
- `frontmatter`: parses YAML frontmatter
- `extract`: adds frontmatter data to the vfile
- [`assetResolver`](https://github.com/krmax44/cocy/blob/main/packages/transform-markdown/src/plugins/assetResolver.ts): custom plugin to resolve assets
- [`excerptGenerator`](https://github.com/krmax44/cocy/blob/main/packages/transform-markdown/src/excerptGenerator.ts): also custom, adds an excerpt to the result's attributes, which is either the frontmatter value of `excerpt`, all paragraphs before a `<!-- more -->` tag or the first paragraph of text (in that order). Can be disabled by setting `config.generateExcerpt` to `false`.
