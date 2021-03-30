import { readFile } from 'fs/promises';
import Houk from 'houk';
import { parse } from 'path';
import mime from 'mime-types';
import Cocy from '.';
import fstat from './utils/fstat';

export type CocyFileAttributes = {
	[key: string]: any;
	createdAt?: Date;
	modifiedAt?: Date;
};

export default class CocyFile<DataType = any> extends Houk<{
	/**
	 * File has been read and content saved to `raw`.
	 */
	fileRead: [];
}> {
	/**
	 * Absolute path to the file
	 */
	public path: string;

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
		super();

		this.path = path;
		this.mimeType = mime.lookup(path);

		const slug = this.instance.options.slugify(parse(path).name);
		this.slug = this.setSlug(slug);

		this.load();
	}

	public load(): void {
		try {
			readFile(this.path, 'utf-8').then(data => {
				this.raw = data;
				this.emit('fileRead');
			});

			fstat(this.path, this.instance.isGitRepo).then(attributes => {
				this.attributes = { ...this.attributes, ...attributes };
			});
		} catch {
			throw `Could not read file ${this.path}`;
		}
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
		if (!text) throw `Invalid text`;

		// give the current slug up for reuse
		this.instance.slugs.delete(this.slug);

		const slug = slugify ? this.instance.options.slugify(text) : text;
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
