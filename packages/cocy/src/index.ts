import path from 'path';
import globby from 'globby';
import chokidar from 'chokidar';
import isRepo from 'is-repo';

import Houk from 'houk';
import slugify from 'slugo';

import { CocyOptions } from './types/CocyOptions';
import { CocyEvents } from './types/CocyEvents';
import CocyFile from './CocyFile';
import CocyFiles from './CocyFiles';

type DropFirstInTuple<T extends any[]> = T extends [arg: any, ...rest: infer U]
	? U
	: T;

export default class Cocy extends Houk<CocyEvents> {
	readonly cwd: string;
	readonly slugify: (input: string) => string;

	/**
	 * Glob patterns for files
	 * @name patterns
	 * @default "[]"
	 */
	public patterns: string[];
	public files: CocyFiles;
	public isGitRepo = false;
	public slugs = new Set<string>();

	public getListeners = super.getListeners;
	public emit = super.emit;

	private watcher?: chokidar.FSWatcher;

	constructor(options: CocyOptions) {
		super();

		const cwd = process.cwd();
		// make sure it's absolute
		this.cwd = options.cwd ? path.resolve(cwd, options.cwd) : cwd;

		this.slugify = options.slugify ?? slugify;
		this.patterns = options.patterns ?? [];

		if (options.watch ?? process.env.NODE_ENV === 'development')
			this.startWatcher();

		this.files = new CocyFiles(this);

		isRepo(cwd).then(result => {
			this.isGitRepo = result;
		});
	}

	/**
	 * Search for files
	 * @param cwd Directory to search files in
	 * @default cwd Cocy instance cwd
	 */
	async discover(cwd = this.cwd): Promise<this> {
		const files = globby.stream(this.patterns, { cwd });
		const queue = [];

		for await (const file of files) {
			const filepath = path.resolve(cwd, <string>file);

			if (!this.files.has(filepath)) {
				const promise = this.add(filepath);
				queue.push(promise);
			}
		}
		await Promise.all(queue);

		this.emit('afterDiscover');

		return this;
	}

	/**
	 * Add or update file
	 * @param filepath: Absolute path to file
	 */
	public async add(filepath: string): Promise<void> {
		const exists = this.files.has(filepath);
		const file = this.files.get(filepath) ?? new CocyFile(this, filepath);

		await file.load();

		if (exists) {
			await this.emitSync('fileUpdated', file);
		} else {
			this.files.set(filepath, file);
			await this.emitSync('fileAdded', file);
		}

		await this.emitSync('fileChanged', file);
	}

	/**
	 * Remove file
	 * @param _file File to remove. Either a CocyFile or an absolute path
	 * @returns True on success, false if file didn't exist
	 */
	public remove(_file: CocyFile | string): boolean {
		let path: string | undefined;
		let file: CocyFile | undefined;

		if (_file instanceof CocyFile) {
			path = [...this.files].find(([, f]) => f === _file)?.[0];
			file = _file;
		} else {
			path = _file;
			file = this.files.get(path);
		}

		if (!path || !file) return false;

		this.emit('fileRemoved', file);
		this.emit('fileChanged', file);
		this.slugs.delete(file.slug);
		return this.files.delete(path);
	}

	/**
	 * Update a file.
	 * @param file
	 */
	public update(file: CocyFile): void {
		this.files.set(file.path.absolute, file);
	}

	/**
	 * Recursively deletes all files in a given directory.
	 * @param dirpath Absolute path of the directory to remove.
	 */
	public removeDir(dirpath: string): void {
		for (const file of this.files.keys()) {
			const { dir } = path.parse(file);

			if (dir.startsWith(dirpath)) {
				this.files.delete(file);
			}
		}
	}

	/**
	 * Start watching the file system for changes.
	 */
	public startWatcher(): void {
		const { cwd, patterns } = this;

		this.watcher = chokidar.watch(patterns, { cwd });

		const listen = (event: string, listener: (filepath: string) => void) => {
			this.watcher?.on(event, filepath => {
				const normalized = path.resolve(cwd, filepath);
				Reflect.apply(listener, this, [normalized]);
			});
		};

		listen('add', this.add);
		listen('change', this.add);
		listen('addDir', this.discover);
		listen('unlink', this.remove);
		listen('unlinkDir', this.removeDir);
	}

	/**
	 * Stop watching the file system for changes.
	 */
	public stopWatcher(): void {
		this.watcher?.close();
	}

	/**
	 * Call a plugin function, so it can register hooks.
	 * @param plugin The plugin which will be registered.
	 * @param options Options, which will be passed to the plugin.
	 */
	public use<Plugin extends (instance: Cocy, ...args: any) => void>(
		plugin: Plugin,
		...options: DropFirstInTuple<Parameters<Plugin>>
	): this {
		plugin(this, ...options);
		return this;
	}
}

export { CocyOptions, CocyFile };
