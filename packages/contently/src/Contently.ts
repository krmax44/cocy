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
import { ContentlyResolvedAsset } from './types/ContentlyAsset';
import { ContentlyEvents } from './types/ContentlyEvents';

export default class Contently extends Houk<ContentlyEvents> {
	public options: ContentlyOptions;
	public files: Map<ContentlyPath, ContentlyFile>;
	public isGitRepo = false;
	private watcher?: chokidar.FSWatcher;

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
	 * @returns True on success, false if file didn't exist
	 */
	public remove(filepath: ContentlyPath): boolean {
		const file = this.files.get(filepath);
		if (file) {
			this.emit('fileRemoved', file);
			this.emit('fileChanged', file);
			return this.files.delete(filepath);
		}
		return false;
	}

	public update(file: ContentlyFile): void {
		this.files.set(file.path, file);
	}

	public removeDir(dirpath: ContentlyPath): void {
		for (const file of this.files.keys()) {
			const { dir } = path.parse(file);

			if (dir === dirpath) {
				this.files.delete(file);
			}
		}
	}

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

	public stopWatcher(): void {
		this.watcher?.close();
	}

	public async resolveAsset(
		assetPath: string,
		file: ContentlyFile,
		key?: string
	): Promise<ContentlyResolvedAsset> {
		const hasAssetHandler = this.getListeners('assetAdded').size > 0;
		if (!hasAssetHandler) return assetPath;

		const resolved: string = await new Promise(resolve => {
			this.emit('assetAdded', resolve, assetPath, file, key);
		});

		if (key) file.assets.set(key, resolved);

		return resolved;
	}

	public use<PluginOptions extends any[]>(
		plugin: (instance: Contently, ...args: any) => void,
		...options: PluginOptions
	): Contently {
		plugin(this, ...options);
		return this;
	}
}

export { ContentlyFile, ContentlyPath } from './types/ContentlyFile';
export { ContentlyAssetHandler } from './types/ContentlyAsset';
