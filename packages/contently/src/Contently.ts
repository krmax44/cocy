/* eslint-disable no-await-in-loop */

import { EventEmitter } from 'events';
import { ContentlyResult } from './ContentlyResult';
import { ContentlyOptions, ContentlyPlugin, PluginList } from './types';

const slugo = require('slugo');

export class Contently extends EventEmitter {
	public plugins: PluginList = [];

	public options: ContentlyOptions;

	public results: ContentlyResult[] = [];

	constructor(options?: ContentlyOptions) {
		super();

		this.options = {
			cwd: process.cwd(),
			slugify: slugo,
			...(options || {})
		};
	}

	use(plugin: ContentlyPlugin, options?: any): Contently {
		this.plugins.push({ plugin, options });
		return this;
	}

	async addResult(
		result: ContentlyResult | ContentlyResult[]
	): Promise<Contently> {
		const array = toArray(result);
		const promises = array.map(
			async result =>
				this._emit('beforeAddResult', result) as Promise<ContentlyResult>
		);

		const results = await Promise.all(promises);

		this.results.push(...results);

		return this;
	}

	async run(): Promise<Contently> {
		await this._emit('beforeRun');

		for (const { plugin, options } of this.plugins) {
			await Promise.resolve(plugin(this, options));
		}

		await this._emit('afterRun');
		return this;
	}

	/**
	 * @name emit
	 * @param id Event ID
	 * @param args Arguments that will be passed along to listeners
	 * @returns Array of potentially modified args
	 * @description Goes over every hook listener one by one
	 */
	private async _emit(id: string, ...args: any): Promise<any> {
		const listeners = this.listeners(id);

		if (listeners.length === 0) {
			return args.length === 1 ? args[0] : args;
		}

		let result: any = args;
		for (const listener of listeners) {
			const array = toArray(result);
			result = (await Promise.resolve(listener.apply(this, array))) || result;
		}

		return result;
	}
}

function toArray(input: any): any[] {
	return Array.isArray(input) ? input : [input];
}
