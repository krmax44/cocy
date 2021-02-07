import { parse } from 'path';
import remark from 'remark';
import html from 'remark-html';
import frontmatter from 'remark-frontmatter';
import extract from 'remark-extract-frontmatter';
import vfile from 'vfile';
import yaml from 'yaml';

import { assetResolver, excerptGenerator } from './plugins';

import Contently from 'contently';

interface Options {
	/**
	 * An array of Remark plugins.
	 * @name plugins
	 * @default 'html,frontmatter,extract-frontmatter'
	 */
	plugins?: Array<{ plugin: any; options?: any }>;
}

export default async function ContentlyTransformMarkdown(
	instance: Contently,
	_options: Options
): Promise<void> {
	// TODO: this sucks to edit as a user

	const options = {
		plugins: [
			{ plugin: html },
			{ plugin: frontmatter },
			{ plugin: extract, options: { yaml: yaml.parse } },
			{ plugin: assetResolver, options: { assetHandler: (a: string) => a } },
			{ plugin: excerptGenerator }
		],
		...(_options || {})
	};

	instance.on('fileAdded', async file => {
		const r = remark();

		for (const { plugin, options: options_ } of options.plugins) {
			r.use(plugin, options_);
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

		const { data, contents } = await r.process(v);

		file.data = contents as string;
		file.attributes = {
			...file.attributes,
			...((data as Record<string, unknown>) || {})
		};
	});
}

export * from './plugins';
