import { parse } from 'path';
import remark from 'remark';
import vfile from 'vfile';
import { ContentlyPlugin } from 'contently/build/ContentlyPlugin';
import { assetResolver, excerptGenerator } from './plugins';

export const name = 'transformMarkdown';

const html = require('remark-html');
const frontmatter = require('remark-frontmatter');
const extract = require('remark-extract-frontmatter');
const yaml = require('yaml').parse;

interface Options {
	/**
	 * @name plugins
	 * @description An array of Remark plugins.
	 * @default 'html,frontmatter,extract-frontmatter'
	 */
	plugins: Array<{ plugin: any; options?: any }>;
}

export async function runner(
	this: ContentlyPlugin,
	_options: Options
): Promise<void> {
	const options = {
		plugins: [
			{ plugin: html },
			{ plugin: frontmatter },
			{ plugin: extract, options: { yaml } },
			{ plugin: assetResolver, options: { plugin: this } },
			{ plugin: excerptGenerator }
		],
		..._options
	};

	this.instance.on('run', async () => {
		const r = remark();

		const plugins = await this.emit(
			'beforePlugins',
			undefined,
			options.plugins
		);
		for (const { plugin, options: opts } of plugins) {
			r.use(plugin, opts);
		}

		const queue = [];
		for (const item of this.instance.results) {
			const promise = new Promise(resolve => {
				const {
					base: basename,
					name: stem,
					ext: extname,
					dir: dirname
				} = parse(item.id);

				const file = vfile({
					contents: item.data,
					cwd: this.instance.options.cwd,
					basename,
					stem,
					extname,
					dirname
				});

				r.process(file).then(async vfile => {
					item.data = vfile.contents as string;
					const data = vfile.data as {
						[key: string]: any;
					};

					const attributes = await this.emit('beforeAttributes', vfile, data);

					const { assets } = attributes;
					delete attributes.assets;

					item.attributes = {
						...item.attributes,
						...attributes
					};
					item.assets = assets || {};

					resolve();
				});
			});

			queue.push(promise);
		}

		await Promise.all(queue);
	});
}
