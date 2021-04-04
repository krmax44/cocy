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
import CocyDir from './CocyDir';

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
	public files: CocyFiles = new CocyFiles(this);
	public dirs: Map<string, CocyDir> = new Map();
	public isGitRepo = false;

	public getListeners = super.getListeners;
	public emit = super.emit;

	private watcher?: chokidar.FSWatcher;

	constructor(options: CocyOptions = {}) {
		super();

		const cwd = process.cwd();
		// make sure it's absolute
		this.cwd = options.cwd ? path.resolve(cwd, options.cwd) : cwd;

		this.slugify = options.slugify ?? slugify;
		this.patterns = options.patterns ?? [];

		if (options.watch ?? process.env.NODE_ENV === 'development')
			this.startWatcher();

		isRepo(cwd).then(result => {
			this.isGitRepo = result;
		});
	}

	/**
	 * Search for files and process them
	 * @param cwd Directory to search files in
	 * @default cwd Cocy instance cwd
	 */
	async process(cwd = this.cwd): Promise<this> {
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

		this.emit('afterProcess');

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
		const file = _file instanceof CocyFile ? _file : this.files.get(_file);

		if (!file) return false;

		this.emit('fileRemoved', file);
		this.emit('fileChanged', file);
		this.dirs.get(file.path.dir)?.slugs.delete(file.slug);
		return this.files.delete(file);
	}

	/**
	 * Recursively deletes all files in a given directory.
	 * @param dirpath Absolute path of the directory to remove.
	 */
	public removeDir(dirpath: string): void {
		for (const file of this.files.values()) {
			const { dir } = file.path;

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
		listen('addDir', this.process);
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

export type { CocyOptions, CocyFile };
export type { CocyFileAttributes, CocyPath } from './CocyFile';
export type { CocyFiles };
