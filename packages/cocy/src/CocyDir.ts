import CocyFile from './CocyFile';

export default class CocyDir {
	public files: Map<string, CocyFile> = new Map();
	public slugs = new Set<string>();

	constructor(public path: string) {}

	/**
	 * get a file by its slug
	 * @param slug Slug to find
	 * @returns file, if found
	 */
	public getBySlug(slug: string): CocyFile | undefined {
		return [...this.files.values()].find(file => file.slug === slug);
	}
}
