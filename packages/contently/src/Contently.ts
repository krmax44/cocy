import Houk from 'houk';
import { ContentlyResult } from './ContentlyResult';
import { ContentlyOptions, ContentlyPluginSetup } from './types';
import { ContentlyPlugin } from './ContentlyPlugin';

const slugify: (input: string) => string = require('slugo');

export class Contently extends Houk {
	public plugins: { [key: string]: ContentlyPlugin } = {};

	public options: ContentlyOptions;

	public results: ContentlyResult[] = [];

	constructor(options?: ContentlyOptions) {
		super();

		this.options = {
			cwd: process.cwd(),
			slugify,
			...(options || {})
		};
	}

	use({ name, runner }: ContentlyPluginSetup, ...options: any): Contently {
		if (this.plugins[name]) {
			throw new Error('Plugin is already in use.');
		}

		const plugin = new ContentlyPlugin({
			name,
			runner,
			options,
			instance: this
		});

		this.plugins[name] = plugin;
		this.emit('afterPluginAdded', this, plugin);

		return this;
	}

	async addResult(
		result: ContentlyResult | ContentlyResult[]
	): Promise<Contently> {
		const array = toArray(result);
		const promises = array.map(
			async result =>
				this.emit('beforeAddResult', this, result) as Promise<ContentlyResult>
		);

		const results = await Promise.all(promises);

		this.results.push(...results);

		return this;
	}

	async run(): Promise<Contently> {
		await this.emit('beforeRun', this);
		await this.emit('run', this);
		await this.emit('afterRun', this);
		return this;
	}
}

function toArray(input: any): any[] {
	return Array.isArray(input) ? input : [input];
}
