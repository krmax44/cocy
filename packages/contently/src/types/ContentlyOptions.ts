export interface ContentlyOptions {
	/**
	 * @name cwd
	 * @description The current working directory.
	 * @default process.cwd()
	 */
	cwd?: string;

	/**
	 * @name slugify
	 * @description A function that slugifies a given input.L0
	 * @default slugo
	 */
	slugify?: (input: string) => string;
}
