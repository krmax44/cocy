import path from 'path';
import globby from 'globby';
import chokidar from 'chokidar';
import isRepo from 'is-repo';

import Houk from 'houk';
import slugify from 'slugo';

import { PATTERNS } from './utils/consts';
import { ContentlyOptions } from './types/ContentlyOptions';
import { ContentlyEvents } from './types/ContentlyEvents';
import ContentlyFile from './ContentlyFile';

type DropFirstInTuple<T extends any[]> = T extends [arg: any, ...rest: infer U]
	? U
	: T;

export default class Contently extends Houk<ContentlyEvents> {
	public options: ContentlyOptions;
	public files: Map<string, ContentlyFile>;
	public isGitRepo = false;
	private watcher?: chokidar.FSWatcher;
	public slugs = new Set<string>();
	public getListeners = super.getListeners;
	public emit = super.emit;

	constructor(options?: Partial<ContentlyOptions>) {
		super();

		const cwd = process.cwd();
		const watch = process.env.NODE_ENV === 'development';

		this.options = {
			cwd,
			watch,
			patterns: PATTERNS,
			slugify,
			...options
		};

		if (this.options.watch) this.startWatcher();

		// make sure it's absolute
		this.options.cwd = path.resolve(cwd, this.options.cwd);

		this.files = new Map();

		isRepo(cwd).then(result => {
			this.isGitRepo = result;
		});
	}

	/**
	 * Search for files
	 * @param cwd Directory to search files in
	 * @default cwd Contently instance cwd
	 */
	async find(cwd = this.options.cwd): Promise<Contently> {
		const files = globby.stream(this.options.patterns, { cwd });
		const queue = [];

		for await (const file of files) {
			const filepath = path.resolve(cwd, file as string);

			if (!this.files.has(filepath)) {
				const promise = this.add(filepath);
				queue.push(promise);
			}
		}
		await Promise.all(queue);

		return this;
	}

	/**
	 * Add or update file
	 * @param filepath: Absolute path to file
	 */
	public async add(filepath: string): Promise<void> {
		const exists = this.files.has(filepath);
		const file = this.files.get(filepath) ?? new ContentlyFile(this, filepath);

		if (exists) {
			// exists, so reload the file
			file.load();
			await file.awaitEvent('fileRead');
			await this.emit('fileUpdated', file);
		} else {
			this.files.set(filepath, file);
			await file.awaitEvent('fileRead');
			await this.emit('fileAdded', file);
		}

		await this.emit('fileChanged', file);
	}

	/**
	 * Remove file
	 * @param _file File to remove. Either a ContentlyFile or an absolute path
	 * @returns True on success, false if file didn't exist
	 */
	public remove(_file: ContentlyFile | string): boolean {
		let path: string | undefined;
		let file: ContentlyFile | undefined;

		if (_file instanceof ContentlyFile) {
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
	public update(file: ContentlyFile): void {
		this.files.set(file.path, file);
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
		const { cwd, patterns } = this.options;

		this.watcher = chokidar.watch(patterns, { cwd });

		const listen = (event: string, listener: (filepath: string) => void) => {
			this.watcher?.on(event, filepath => {
				const normalized = path.resolve(cwd, filepath);
				Reflect.apply(listener, this, [normalized]);
			});
		};

		listen('add', this.add);
		listen('change', this.add);
		listen('addDir', this.find);
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
	public use<Plugin extends (instance: Contently, ...args: any) => void>(
		plugin: Plugin,
		...options: DropFirstInTuple<Parameters<Plugin>>
	): this {
		plugin(this, ...options);
		return this;
	}
}

export { ContentlyOptions, ContentlyFile };
