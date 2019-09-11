import { HoukBus } from 'houk';
import { Contently } from '.';

type Runner = (this: ContentlyPlugin, ...options: any) => void;

interface PluginConstructor {
	name: string;
	runner: Runner;
	instance: Contently;
	options: any[];
}

export class ContentlyPlugin extends HoukBus {
	public name: string;

	protected instance: Contently;

	private _runner: Runner;

	constructor({ name, runner, instance, options }: PluginConstructor) {
		super();
		this.name = name;
		this.instance = instance;
		this._runner = runner;
		this._runner.apply(this, options); // eslint-disable-line prefer-spread
	}
}
