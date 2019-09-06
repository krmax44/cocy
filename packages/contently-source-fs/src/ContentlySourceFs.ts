import { join, parse } from 'path';
import { readFile, stat } from 'fs-extra';
import globby, { GlobbyOptions } from 'globby';
import { Contently, ContentlyResult } from 'contently';

interface Options extends GlobbyOptions {
	/**
	 * @name patterns
	 * @description One or multiple glob patterns
	 * @default "['*.md', '*.markdown', '!.*', '!_*']"
	 */
	patterns: string | string[];
}

export default async function(
	instance: Contently,
	_options: Options
): Promise<void> {
	const options = {
		patterns: ['*.md', '*.markdown', '!.*', '!_*'],
		..._options
	};
	const files: Array<Promise<ContentlyResult>> = [];

	for await (const file of globby.stream(options.patterns, {
		...options,
		cwd: instance.options.cwd
	})) {
		files.push(
			new Promise((resolve, reject) => {
				const path = join(instance.options.cwd, file as string);

				readFile(path, 'utf8')
					.then(async data => {
						const title = parse(path).name;
						const { birthtime: createdAt, mtime: modifiedAt } = await stat(
							path
						);
						resolve(
							new ContentlyResult({
								id: path,
								slug: instance.options.slugify(title),
								data,
								attributes: { createdAt, modifiedAt, title }
							})
						);
					})
					.catch(reject);
			})
		);
	}

	const results = await Promise.all(files);
	instance.addResult(results);
}
