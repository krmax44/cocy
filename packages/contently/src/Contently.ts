import { ContentlyOptions, ContentlyPlugin, PluginList } from './types';

import { ContentlyResult } from './ContentlyResult';

const slugo = require('slugo');

export class Contently {
	public plugins: PluginList = [];

	public options: ContentlyOptions;

	public results: ContentlyResult[] = [];

	constructor(options: ContentlyOptions) {
		this.options = {
			cwd: process.cwd(),
			slugify: slugo,
			...options
		};
	}

	use(plugin: ContentlyPlugin, options?: any): Contently {
		this.plugins.push({ plugin, options });
		return this;
	}

	addResult(result: ContentlyResult | ContentlyResult[]): Contently {
		if (Array.isArray(result)) this.results.push(...result);
		else this.results.push(result);
		return this;
	}

	async run(): Promise<Contently> {
		for (const { plugin, options } of this.plugins) {
			await Promise.resolve(plugin(this, options)); // eslint-disable-line no-await-in-loop
		}

		return this;
	}
}
