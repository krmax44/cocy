import CocyFile from './CocyFile';

export default class CocyDir {
	public files: Map<string, CocyFile> = new Map();
	public slugs = new Set<string>();

	constructor(public path: string) {}
}
