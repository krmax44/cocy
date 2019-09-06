import * as path from 'path';
import globby, { GlobbyOptions } from 'globby';
import { readFile, stat } from 'fs-extra';

export class ContentlySourceFs {
	public patterns: string | string[];

	public options: GlobbyOptions;

	constructor(patterns?: string | string[], options?: GlobbyOptions) {
		this.patterns = patterns || ['*.md', '*.markdown', '!.*', '!_*'];
		this.options = options;
	}

	async source() {
		const files = [];
		const cwd = this.options.cwd || process.cwd();

		for await (const file of globby.stream(this.patterns, this.options)) {
			files.push(
				new Promise((resolve, reject) => {
					const location = path.join(cwd, file as string);
					readFile(location, 'utf8')
						.then(async (data: string) => {
							const slug = path.parse(location).name;
							const { ctime: createdAt, mtime: modifiedAt } = await stat(
								location
							);
							resolve({
								id: location,
								slug,
								createdAt,
								modifiedAt,
								data
							});
						})
						.catch(reject);
				})
			);
		}

		return Promise.all(files);
	}
}
