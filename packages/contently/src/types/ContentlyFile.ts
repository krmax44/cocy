/**
 * Absolute path to a file.
 * @name ContentlyPath
 */
export type ContentlyPath = string;

export interface ContentlyFile {
	path: ContentlyPath;

	/**
	 * Slug of the file
	 * @name slug
	 */
	slug: string;

	/**
	 * File contents
	 * @name data
	 */
	data: string;

	/**
	 * File attributes
	 * @name attributes
	 */
	attributes: {
		[key: string]: any;
		createdAt: Date;
		modifiedAt: Date;
	};
}
