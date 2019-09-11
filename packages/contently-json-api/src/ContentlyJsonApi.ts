import { join, parse } from 'path';
import { writeJson, ensureDir } from 'fs-extra';
import { Contently } from 'contently';
import { ContentlyPlugin } from 'contently/build/ContentlyPlugin';

export const name = 'jsonApi';

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

export async function runner(
	this: ContentlyPlugin,
	_options?: Options
): Promise<void> {
	const options = {
		output: 'content',
		transformer: defaultTransformer,
		..._options
	};

	this.instance.on('run', async function(this: Contently) {
		const tree = await Promise.resolve(
			options.transformer(this, {
				...options,
				output: join(this.options.cwd, options.output)
			})
		);

		const queue = [];
		for (const { path, content } of tree) {
			const { dir } = parse(path);
			queue.push(ensureDir(dir).then(async () => writeJson(path, content)));
		}

		await Promise.all(queue);
	});
}
