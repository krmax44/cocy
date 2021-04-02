import type vfile from 'vfile';

export type RemarkPlugins = Array<{ plugin: any; options?: any }>;

export interface Options {
	/**
	 * If true, generates an excerpt.
	 * @name generateExcerpt
	 * @default true
	 */
	generateExcerpt?: boolean;

	/**
	 * If true, generates a title from the file's first heading.
	 */
	generateTitle?: boolean;

	/**
	 * If true, generates a slug from the file's first heading.
	 */
	generateSlug?: boolean;

	/**
	 * An array of Remark plugins.
	 * @name plugins
	 * @default 'html,frontmatter,extract-frontmatter'
	 */
	plugins?: RemarkPlugins;
}

export type MdData = {
	html: string;
	vfile: vfile.VFile;
};
