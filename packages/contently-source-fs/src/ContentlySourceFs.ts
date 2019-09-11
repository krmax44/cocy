import { join, parse } from 'path';
import { readFile, stat } from 'fs-extra';
import globby, { GlobbyOptions } from 'globby';
import { ContentlyResult, Contently } from 'contently';
import { ContentlyPlugin } from 'contently/build/ContentlyPlugin';

export const name = 'sourceFs';

interface Options extends GlobbyOptions {
	/**
	 * @name patterns
	 * @description One or multiple glob patterns
	 * @default "['*.md', '*.markdown', '!.*', '!_*']"
	 */
	patterns: string | string[];
}

export async function runner(
	this: ContentlyPlugin,
	_options: Options
): Promise<void> {
	const options = {
		patterns: ['*.md', '*.markdown', '!.*', '!_*'],
		..._options
	};

	this.instance.on('run', async function(this: Contently) {
		const files: Array<Promise<ContentlyResult>> = [];

		for await (const file of globby.stream(options.patterns, {
			...options,
			cwd: this.options.cwd
		})) {
			files.push(
				new Promise((resolve, reject) => {
					const path = join(this.options.cwd, file as string);

					readFile(path, 'utf8')
						.then(async data => {
							const title = parse(path).name;
							const { birthtime: createdAt, mtime: modifiedAt } = await stat(
								path
							);
							resolve(
								new ContentlyResult({
									id: path,
									slug: this.options.slugify(title),
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
		await this.addResult(results);
	});
}
