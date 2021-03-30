import ContentlyFile from './ContentlyFile';

export default class ContentlyFiles extends Map<string, ContentlyFile> {
	constructor(files: Iterable<[string, ContentlyFile]> = []) {
		super(files);
	}

	public find(
		fn: (file: ContentlyFile, index: number) => boolean
	): ContentlyFile | undefined {
		let index = 0;
		for (const file of this.values()) {
			if (fn(file, index++)) {
				return file;
			}
		}
	}

	public getBySlug(slug: string): ContentlyFile | undefined {
		return this.find(file => file.slug === slug);
	}
}
