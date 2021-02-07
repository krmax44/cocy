export interface ContentlyOptions {
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
	 * A function that slugifies a given input.
	 * @name slugify
	 * @default slugo
	 */
	slugify: (input: string) => string;

	/**
	 * Glob patterns for files
	 * @name patterns
	 * @default "['*.md', '*.markdown', '*.mdwn', '!.*', '!_*']"
	 */
	patterns: string[];
}
