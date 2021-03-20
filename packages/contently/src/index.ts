import path from 'path';
import { readFile } from 'fs/promises';

import globby from 'globby';
import chokidar from 'chokidar';
import fstat from './utils/fstat';
import isRepo from 'is-repo';

import Houk from 'houk';
import slugify from 'slugo';

import { PATTERNS } from './utils/consts';
import { ContentlyOptions } from './types/ContentlyOptions';
import { ContentlyFile, ContentlyPath } from './types/ContentlyFile';
import { ContentlyEvents } from './types/ContentlyEvents';

type DropFirstInTuple<T extends any[]> = T extends [arg: any, ...rest: infer U]
	? U
	: T;

export default class Contently extends Houk<ContentlyEvents> {
	public options: ContentlyOptions;
	public files: Map<ContentlyPath, ContentlyFile>;
	public isGitRepo = false;
	private watcher?: chokidar.FSWatcher;
	private slugs = new Set<string>();

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
	 */
	public async add(filepath: ContentlyPath): Promise<void> {
		const { isGitRepo } = this;

		try {
			const data = await readFile(filepath, 'utf8');
			const attributes = await fstat(filepath, isGitRepo);
			const slug = slugify(path.parse(filepath).name);
			const assets = new Map();

			const file: ContentlyFile = {
				path: filepath,
				data,
				slug,
				attributes,
				assets
			};

			const exists = this.files.has(filepath);
			this.files.set(filepath, file);

			if (exists) {
				await this.emit('fileUpdated', file);
			} else {
				await this.emit('fileAdded', file);
			}

			await this.emit('fileChanged', file);
		} catch {
			throw new Error(`Could not read file ${filepath}`);
		}
	}

	/**
	 * Remove file
	 * @param _file File to remove
	 * @returns True on success, false if file didn't exist
	 */
	public remove(_file: ContentlyFile | ContentlyPath): boolean {
		let path: string | undefined;
		let file: ContentlyFile | undefined;

		if (typeof _file !== 'string') {
			path = [...this.files].find(([, f]) => f === _file)?.[0];
			file = _file;
		} else {
			path = _file;
			file = this.files.get(path);
		}

		if (!path || !file) return false;

		this.emit('fileRemoved', file);
		this.emit('fileChanged', file);
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
	 * @param dirpath Path of the directory to remove.
	 */
	public removeDir(dirpath: ContentlyPath): void {
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

		const listen = (
			event: string,
			listener: (filepath: ContentlyPath) => void
		) => {
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
	 * Resolve an asset.
	 * @param assetPath The absolute path of the asset.
	 * @param file The parent file to which the asset belongs to.
	 * @param key An optional key, with which the asset can be retrieved from the file.
	 */
	public async resolveAsset(
		assetPath: string,
		file: ContentlyFile,
		key?: string
	): Promise<string> {
		const hasAssetHandler = this.getListeners('assetAdded').size > 0;
		if (!hasAssetHandler) return assetPath;

		const resolved: string = await new Promise(resolve => {
			this.emit('assetAdded', resolve, assetPath, file, key);
		});

		if (key) file.assets.set(key, resolved);

		return resolved;
	}

	/**
	 * Generates a slug and updates the file.
	 * @param file The file, of which the slug will be set
	 * @param text The text to slugify.
	 * @param slugify Slugify the text using the set slugify function. True by default.
	 */
	public findSlug(file: ContentlyFile, text: string, slugify = true): string {
		// give the current slug up for reuse
		this.slugs.delete(file.slug);

		const slug = slugify ? this.options.slugify(text) : text;
		let i = 1;
		let availableSlug = slug;

		while (this.slugs.has(availableSlug)) {
			availableSlug = `${slug}-${i++}`;
		}

		file.slug = availableSlug;
		return availableSlug;
	}

	/**
	 * Call a plugin function, so it can register hooks.
	 * @param plugin The plugin which will be registered.
	 * @param options Options, which will be passed to the plugin.
	 */
	public use<Plugin extends (instance: Contently, ...args: any) => void>(
		plugin: Plugin,
		...options: DropFirstInTuple<Parameters<Plugin>>
	): Contently {
		plugin(this, ...options);
		return this;
	}
}

export { ContentlyFile, ContentlyPath } from './types/ContentlyFile';
export { ContentlyOptions };
