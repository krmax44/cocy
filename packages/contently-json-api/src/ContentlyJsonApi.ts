import { join, parse } from 'path';
import { writeJson, ensureDir } from 'fs-extra';
import { Contently } from 'contently';

/**
 * @name FileTree
 * @description Key of object holds path, value holds JSON.stringify-able content which will be written to that path
 */
type FileTree = Array<{
	path: string;
	content: any;
}>;

interface Options {
	/**
	 * @name output
	 * @description Output path relative to cwd.
	 * @default content/
	 */
	output: string;

	/**
	 * @name transformer
	 * @description A custom transformer function, that given with the results generates a file tree.
	 */
	transformer: (
		instance: Contently,
		options: Options
	) => FileTree | Promise<FileTree>;
}

function defaultTransformer(instance: Contently, options: Options): FileTree {
	const tree: FileTree = [];

	for (const item of instance.results) {
		const path = join(options.output, `${item.slug}.json`);
		tree.push({
			path,
			content: {
				...item,
				id: undefined
			}
		});
	}

	return tree;
}

export default async function(
	instance: Contently,
	_options?: Options
): Promise<void> {
	const options = {
		output: 'content',
		transformer: defaultTransformer,
		..._options
	};

	options.output = join(instance.options.cwd, options.output);

	const tree = await Promise.resolve(options.transformer(instance, options));
	const queue = [];

	for (const { path, content } of tree) {
		const { dir } = parse(path);
		queue.push(ensureDir(dir).then(async () => writeJson(path, content)));
	}

	await Promise.all(queue);
}
