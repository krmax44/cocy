import { parse } from 'path';
import unified from 'unified';
import markdown from 'remark-parse';
import html from 'remark-html';
import frontmatter from 'remark-frontmatter';
import extract from 'remark-extract-frontmatter';
import vfile from 'vfile';
import yaml from 'yaml';

import { assetResolver, excerptGenerator } from './plugins';
import type { MdData, RemarkPlugins, Options } from './types';

import type Cocy from 'cocy';
import type { CocyFile } from 'cocy';
import { titleGenerator } from './plugins/titleGenerator';

export const defaultPlugins: RemarkPlugins = [
	{ plugin: markdown },
	{ plugin: frontmatter },
	{ plugin: extract, options: { yaml: yaml.parse } },
	{ plugin: html }
];

export type CocyMdFile = CocyFile<MdData>;

export default function CocyTransformMarkdown(
	instance: Cocy,
	_options?: Options
): void {
	const options = {
		plugins: defaultPlugins,
		generateExcerpt: true,
		generateTitle: true,
		generateSlug: true,
		...(_options || {})
	};

	if (instance.patterns.length === 0) {
		instance.patterns.push('**/*.{md,mdwn,markdown}');
	}

	async function process(file: CocyFile): Promise<void> {
		if (file.mimeType !== 'text/markdown') return;

		const u = unified();

		const plugins = [...options.plugins];
		if (options.generateExcerpt) {
			plugins.push({ plugin: excerptGenerator });
		}

		plugins.push({ plugin: assetResolver, options: { file } });

		if (options.generateTitle || options.generateSlug) {
			plugins.push({
				plugin: titleGenerator,
				options: {
					title: options.generateTitle,
					slug: options.generateSlug,
					file
				}
			});
		}

		for (const { plugin, options: opts } of plugins) {
			u.use(plugin, opts);
		}

		const { base: basename, name: stem, ext: extname, dir: dirname } = parse(
			file.path.absolute
		);

		const v = vfile({
			contents: file.raw?.toString(),
			cwd: instance.cwd,
			basename,
			stem,
			extname,
			dirname
		});

		const { data, contents } = await u.process(v);

		const mdData: MdData = { html: contents.toString(), vfile: v };
		file.data = mdData;
		file.attributes = {
			...file.attributes,
			...((data as Record<string, unknown>) || {})
		};

		delete file.attributes.assets;
	}

	instance.on('fileAdded', process);
	instance.on('fileUpdated', process);
}

export { assetResolver, excerptGenerator } from './plugins';
