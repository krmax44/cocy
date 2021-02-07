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

export type ContentlyEvents = {
	/**
	 * Triggered when a new file was added.
	 */
	addFile: [file: ContentlyFile];

	/**
	 * Triggered when a file was removed.
	 */
	removeFile: [file: ContentlyFile];

	/**
	 * Triggered when a file's content changed.
	 */
	updateFile: [file: ContentlyFile];

	/**
	 * Triggered when any file event occured (added, deleted...)
	 */
	changeFile: [file: ContentlyFile];
};

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
			...(options ?? {})
		};

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
	async find(cwd = this.options.cwd) {
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
	}

	/**
	 * Add or update file
	 */
	public async add(filepath: ContentlyPath) {
		const { isGitRepo } = this;

		try {
			const data = await readFile(filepath, 'utf8');
			const attributes = await fstat(filepath, isGitRepo);
			const slug = slugify(path.parse(filepath).name);

			const file = {
				path: filepath,
				data,
				slug,
				attributes
			};

			this.files.set(filepath, file);
			this.emit('addFile', file);
		} catch {
			throw new Error(`Could not read file ${filepath}`);
		}
	}

	/**
	 * Remove file
	 * @returns True on success, false if file didn't exist
	 */
	public remove(filepath: ContentlyPath) {
		const file = this.files.get(filepath);
		if (file) {
			this.emit('removeFile', file);
			this.files.delete(filepath);
		}
	}

	public removeDir(dirpath: ContentlyPath) {
		for (const file of this.files.keys()) {
			const { dir } = path.parse(file);

			if (dir === dirpath) {
				this.files.delete(file);
			}
		}
	}

	public watch() {
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

	public use(
		plugin: (instance: Contently, ...args: any) => void,
		...options: any
	) {
		plugin(this, ...options);
		return this;
	}
}

export { ContentlyFile, ContentlyPath } from './types/ContentlyFile';
