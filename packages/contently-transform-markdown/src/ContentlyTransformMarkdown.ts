import { Contently } from 'contently';
import remark from 'remark';

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

export default async function(
	instance: Contently,
	_options: Options
): Promise<void> {
	const options = {
		plugins: [
			{ plugin: html },
			{ plugin: frontmatter },
			{ plugin: extract, options: { yaml } }
		],
		..._options
	};

	const r = remark();
	for (const { plugin, options: opts } of options.plugins) {
		r.use(plugin, opts);
	}

	const queue = [];
	for (const item of instance.results) {
		queue.push(
			new Promise(resolve => {
				r.process(item.data).then(vfile => {
					item.data = vfile.contents as string;
					item.attributes = {
						...item.attributes,
						...(vfile.data as { [key: string]: any })
					};
					resolve();
				});
			})
		);
	}

	await Promise.all(queue);
}
