import ContentlyFile from '../ContentlyFile';

export type ContentlyEvents = {
	/**
	 * Triggered when a new file was added.
	 */
	fileAdded: [file: ContentlyFile];

	/**
	 * Triggered when a file was removed.
	 */
	fileRemoved: [file: ContentlyFile];

	/**
	 * Triggered when a file's content changed.
	 */
	fileUpdated: [file: ContentlyFile];

	/**
	 * Triggered when any file event occured (added, deleted...)
	 */
	fileChanged: [file: ContentlyFile];

	/**
	 * Triggered when a new asset was found.
	 */
	assetAdded: [
		resolve: (resolvedPath: string) => void,
		assetPath: string,
		file: ContentlyFile,
		key?: string
	];
};
