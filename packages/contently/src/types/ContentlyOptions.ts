import { ContentlyAssetHandler } from './ContentlyAsset';

export interface ContentlyOptions {
	/**
	 * Glob patterns for files
	 * @name patterns
	 * @default "['*.md', '*.markdown', '*.mdwn', '!.*', '!_*']"
	 */
	patterns: string[];

	/**
	 * The current working directory.
	 * @name cwd
	 * @default process.cwd()
	 */
	cwd: string;

	/**
	 * Watch files and rebuild on change
	 * @name watch
	 * @default "process.env.NODE_ENV === 'development'"
	 */
	watch: boolean;

	/**
	 * Handle a newly found asset. Return the transformed asset url.
	 * @name assetHandler
	 * @default undefined
	 */
	assetHandler?: ContentlyAssetHandler;

	/**
	 * A function that slugifies a given input.
	 * @name slugify
	 * @default slugo
	 */
	slugify: (input: string) => string;
}
