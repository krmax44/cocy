import { parse } from 'path';
import unified from 'unified';
import markdown from 'remark-parse';
import html from 'remark-html';
import frontmatter from 'remark-frontmatter';
import extract from 'remark-extract-frontmatter';
import vfile from 'vfile';
import yaml from 'yaml';

import { assetResolver, excerptGenerator } from './plugins';

import Contently from 'contently';

type RemarkPlugins = Array<{ plugin: any; options?: any }>;

interface Options {
	/**
	 * If true, generates an excerpt.
	 * @name generateExcerpt
	 * @default true
	 */
	generateExcerpt?: boolean;

	/**
	 * An array of Remark plugins.
	 * @name plugins
	 * @default 'html,frontmatter,extract-frontmatter'
	 */
	plugins?: RemarkPlugins;
}

export const defaultPlugins: RemarkPlugins = [
	{ plugin: markdown },
	{ plugin: frontmatter },
	{ plugin: extract, options: { yaml: yaml.parse } }
];

export default async function ContentlyTransformMarkdown(
	instance: Contently,
	_options: Options
): Promise<void> {
	const options = {
		plugins: defaultPlugins,
		generateExcerpt: true,
		...(_options || {})
	};

	// TODO: handle other events
	instance.on('fileAdded', async file => {
		const u = unified();

		const plugins = [...options.plugins];
		if (options.generateExcerpt) {
			plugins.push({ plugin: excerptGenerator });
		}

		plugins.push({ plugin: assetResolver, options: { instance, file } });
		plugins.push({ plugin: html });

		for (const { plugin, options: opts } of plugins) {
			u.use(plugin, opts);
		}

		const { base: basename, name: stem, ext: extname, dir: dirname } = parse(
			file.path
		);

		const v = vfile({
			contents: file.data,
			cwd: instance.options.cwd,
			basename,
			stem,
			extname,
			dirname
		});

		const { data, contents } = await u.process(v);

		file.data = contents.toString();
		file.attributes = {
			...file.attributes,
			...((data as Record<string, unknown>) || {})
		};

		delete file.attributes.assets;
	});
}

export { assetResolver, excerptGenerator } from './plugins';
