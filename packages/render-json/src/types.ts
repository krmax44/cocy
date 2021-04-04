import type Cocy from 'cocy';
import type { CocyFile } from 'cocy';

export type CocyFileFields = Array<keyof CocyFile>;
export type OptionalPromise<T> = T | Promise<T>;
export type DestLocation = { folder: string; filepath: string };

export interface Options {
	/**
	 * Attributes, which should be rendered to JSON.
	 * @default slug,attributes,data,assets
	 */
	fields?: CocyFileFields;

	/**
	 * A custom transformer function, called for each file. The return value will be saved to JSON.
	 * Overrides the fields option.
	 */
	transformer?: (
		file: CocyFile,
		instance: Cocy
	) => OptionalPromise<Record<string, any> | undefined>;

	/**
	 * A custom index.json generator. Will be called, after .process() finished.
	 * The return value will be saved as the index JSON.
	 */
	indexGenerator?: (
		instance: Cocy,
		determineLocation: (file: CocyFile) => DestLocation
	) => OptionalPromise<any>;

	/**
	 * Set the file name of the index.
	 * @default _index.json
	 */
	indexFile?: string;

	/**
	 * Output directory for built JSON files, relative to the instance's cwd.
	 * @default outDir cocy in cwd's parent directory
	 */
	outDir?: string;

	/**
	 * Clean directory before build
	 * @default clean false
	 */
	clean?: boolean;
}
