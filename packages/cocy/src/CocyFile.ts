import { readFile } from 'fs/promises';
import { parse, relative } from 'path';
import type { ParsedPath } from 'path';
import mime from 'mime-types';
import Cocy from '.';
import fstat from './utils/fstat';

export type CocyFileAttributes = {
	[key: string]: any;
	createdAt?: Date;
	modifiedAt?: Date;
};

export interface CocyPath extends ParsedPath {
	absolute: string;
	relative: string;
}
export default class CocyFile<DataType = any> {
	/**
	 * Path to the file
	 */
	readonly path: CocyPath;

	/**
	 * Mime type of the file
	 */
	public mimeType: string | false;

	/**
	 * Slug of the file
	 * @name slug
	 */
	public slug: string;

	/**
	 * File contents before any transformation
	 */
	public raw?: string;

	/**
	 * Transformed file contents
	 * @name data
	 */
	public data?: DataType;

	/**
	 * File attributes
	 * @name attributes
	 */
	public attributes: CocyFileAttributes = {};

	/**
	 * Resolved assets.
	 */
	public assets = new Map<string, string>();

	constructor(private instance: Cocy, path: string) {
		this.path = {
			...parse(path),
			relative: relative(instance.cwd, path),
			absolute: path
		};
		this.mimeType = mime.lookup(path);

		const slug = this.instance.slugify(this.path.name);
		this.slug = this.setSlug(slug);
	}

	public async load(): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				readFile(this.path.absolute, 'utf-8').then(data => {
					this.raw = data;
					resolve();
				});

				fstat(this.path.absolute, this.instance.isGitRepo).then(attributes => {
					this.attributes = { ...this.attributes, ...attributes };
				});
			} catch {
				reject(`Could not read file ${this.path}`);
			}
		});
	}

	/**
	 * Resolve an asset.
	 * @param assetPath The absolute path of the asset.
	 * @param key An optional key, with which the asset can be retrieved from the file.
	 */
	public async resolveAsset(assetPath: string, key?: string): Promise<string> {
		const hasAssetHandler = this.instance.getListeners('assetAdded').size > 0;
		if (!hasAssetHandler) return assetPath;

		const resolved: string = await new Promise(resolve => {
			this.instance.emit('assetAdded', resolve, assetPath, this, key);
		});

		if (key) this.assets.set(key, resolved);

		return resolved;
	}

	/**
	 * Generates a slug and updates the file.
	 * @param text The text to slugify.
	 * @param slugify Slugify the text using the set slugify function. True by default.
	 */
	public setSlug(text: string, slugify = true): string {
		if (!text) throw 'Invalid text';

		// give the current slug up for reuse
		this.instance.slugs.delete(this.slug);

		const slug = slugify ? this.instance.slugify(text) : text;
		let i = 1;
		let availableSlug = slug;

		while (this.instance.slugs.has(availableSlug)) {
			availableSlug = `${slug}-${i++}`;
		}

		this.slug = availableSlug;
		this.instance.slugs.add(availableSlug);
		return availableSlug;
	}
}
