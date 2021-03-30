import path from 'path';
import Cocy from '.';
import CocyFile from './CocyFile';

export default class CocyFiles extends Map<string, CocyFile> {
	constructor(
		private instance: Cocy,
		files: Iterable<[string, CocyFile]> = []
	) {
		super(files);
	}

	private toArray(): CocyFile[] {
		return [...this.values()];
	}

	/**
	 * Find a file using Array.find
	 * @param fn Iterator function
	 * @returns file, if found
	 */
	public find(
		fn: (file: CocyFile, index: number) => boolean
	): CocyFile | undefined {
		return this.toArray().find(fn);
	}

	/**
	 * Filter files using Array.filter
	 * @param fn Iterator function
	 * @returns filtered files
	 */
	public filter(fn: (file: CocyFile, index: number) => boolean): CocyFile[] {
		return this.toArray().filter(fn);
	}

	/**
	 * get a file by its slug
	 * @param slug Slug to find
	 * @returns file, if found
	 */
	public getBySlug(slug: string): CocyFile | undefined {
		return this.find(file => file.slug === slug);
	}

	/**
	 * get a file by its relative or absolute path
	 * @param segments path segments passed to path.join
	 * @returns file, if found
	 */
	public getByPath(...segments: string[]): CocyFile | undefined {
		const file = path.join(this.instance.options.cwd, ...segments);
		return this.get(file);
	}

	/**
	 * get all files that are located in a given directory
	 * @param _dir relative or absolute path to dir
	 * @returns files
	 */
	public getInDir(_dir: string): CocyFile[] {
		const dir = path.join(this.instance.options.cwd, _dir);
		return this.filter(file => file.path.startsWith(dir));
	}
}
