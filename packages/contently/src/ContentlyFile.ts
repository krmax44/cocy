import { readFile } from 'fs/promises';
import Houk from 'houk';
import { parse } from 'path';
import Contently from '.';
import fstat from './utils/fstat';

export type ContentlyFileAttributes = {
	[key: string]: any;
	createdAt?: Date;
	modifiedAt?: Date;
};

export default class ContentlyFile<DataType = any> extends Houk<{
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
	public attributes: ContentlyFileAttributes = {};

	/**
	 * Resolved assets.
	 */
	public assets = new Map<string, string>();

	constructor(private instance: Contently, path: string) {
		super();

		this.path = path;
		const slug = this.instance.options.slugify(parse(path).name);
		this.slug = this.setSlug(slug);

		readFile(path, 'utf-8')
			.then(data => {
				this.raw = data;
				this.emit('fileRead');
			})
			.catch(e => console.error(this, e));

		fstat(path, instance.isGitRepo).then(attributes => {
			this.attributes = { ...this.attributes, ...attributes };
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
		return availableSlug;
	}
}
