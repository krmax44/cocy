import { join, parse } from 'path';
import { readFile, stat } from 'fs-extra';
import globby, { GlobbyOptions } from 'globby';
import { ContentlyResult, Contently } from 'contently';
import { ContentlyPlugin } from 'contently/build/ContentlyPlugin';
import gitFstat from 'git-fstat';
import isRepo from 'is-repo';

export const name = 'sourceFs';

interface Options extends GlobbyOptions {
	/**
	 * @name patterns
	 * @description One or multiple glob patterns
	 * @default "['*.md', '*.markdown', '!.*', '!_*']"
	 */
	patterns: string | string[];
}

export function runner(this: ContentlyPlugin, _options: Options): void {
	const options = {
		patterns: ['*.md', '*.markdown', '!.*', '!_*'],
		..._options
	};

	this.instance.on('run', async function(this: Contently) {
		const gitRepo = await isRepo(this.options.cwd);
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
							const stats = await fstats(path, gitRepo);

							resolve(
								new ContentlyResult({
									id: path,
									slug: this.options.slugify(title),
									data,
									attributes: { ...stats, title }
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

async function fstats(
	path: string,
	gitRepo: boolean
): Promise<{ createdAt: Date; modifiedAt: Date }> {
	if (gitRepo) {
		const { createdAt, modifiedAt } = await gitFstat(path);
		return { createdAt, modifiedAt };
	}

	const { birthtime: createdAt, mtime: modifiedAt } = await stat(path);
	return { createdAt, modifiedAt };
}
