export interface CocyOptions {
	/**
	 * Glob patterns for files
	 * @name patterns
	 * @default [] provided by transformer plugins, if omitted
	 */
	patterns?: string[];

	/**
	 * The current working directory.
	 * @name cwd
	 * @default process.cwd()
	 */
	cwd?: string;

	/**
	 * Watch files and rebuild on change
	 * @name watch
	 * @default "process.env.NODE_ENV === 'development'"
	 */
	watch?: boolean;

	/**
	 * A function that slugifies a given input.
	 * @name slugify
	 * @default slugo
	 */
	slugify?: (input: string) => string;
}
