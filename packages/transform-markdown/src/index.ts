import { parse } from 'path';
import unified from 'unified';
import markdown from 'remark-parse';
import html from 'remark-html';
import frontmatter from 'remark-frontmatter';
import extract from 'remark-extract-frontmatter';
import vfile from 'vfile';
import yaml from 'yaml';

import { assetResolver, excerptGenerator } from './plugins';

import Contently, { ContentlyFile } from 'contently';
import { titleGenerator } from './plugins/titleGenerator';

type RemarkPlugins = Array<{ plugin: any; options?: any }>;

interface Options {
	/**
	 * If true, generates an excerpt.
	 * @name generateExcerpt
	 * @default true
	 */
	generateExcerpt?: boolean;

	/**
	 * If true, generates a title from the file's first heading.
	 */
	generateTitle?: boolean;

	/**
	 * If true, generates a slug from the file's first heading.
	 */
	generateSlug?: boolean;

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
	{ plugin: extract, options: { yaml: yaml.parse } },
	{ plugin: html }
];

type MdData = {
	html: string;
	vfile: vfile.VFile;
};

export type ContentlyMdFile = ContentlyFile<MdData>;

export default async function ContentlyTransformMarkdown(
	instance: Contently,
	_options?: Options
): Promise<void> {
	const options = {
		plugins: defaultPlugins,
		generateExcerpt: true,
		generateTitle: true,
		generateSlug: true,
		...(_options || {})
	};

	async function process(file: ContentlyFile): Promise<void> {
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
			file.path
		);

		const v = vfile({
			contents: file.raw?.toString(),
			cwd: instance.options.cwd,
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
