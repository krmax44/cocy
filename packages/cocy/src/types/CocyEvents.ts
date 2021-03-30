import CocyFile from '../CocyFile';

export type CocyEvents = {
	/**
	 * Triggered when a new file was added.
	 */
	fileAdded: [file: CocyFile];

	/**
	 * Triggered when a file was removed.
	 */
	fileRemoved: [file: CocyFile];

	/**
	 * Triggered when a file's content changed.
	 */
	fileUpdated: [file: CocyFile];

	/**
	 * Triggered when any file event occured (added, deleted...)
	 */
	fileChanged: [file: CocyFile];

	/**
	 * Triggered when a new asset was found.
	 */
	assetAdded: [
		resolve: (resolvedPath: string) => void,
		assetPath: string,
		file: CocyFile,
		key?: string
	];
};
