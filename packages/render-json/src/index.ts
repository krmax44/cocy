import fs from 'fs/promises';
import path from 'path';
import Cocy, { CocyFile } from 'cocy';

type CocyFileFields = Array<keyof CocyFile>;

interface Options {
	/**
	 * Attributes, which should be rendered to JSON.
	 * @default slug,attributes,data,assets
	 */
	fields?: CocyFileFields;

	/**
	 * Output directory for built JSON files, relative to the instance's cwd.
	 * @default outDir cocy in cwd's parent directory
	 */
	outDir?: string;

	/**
	 * Clean directory before build
	 * @default clean false
	 */
	clean?: boolean;
}

const mapToObj = <K extends string, V>(map: Map<K, V>) =>
	Array.from(map.entries()).reduce(
		(main, [key, value]) => ({ ...main, [key]: value }),
		{}
	);

const defaultFields: CocyFileFields = ['slug', 'attributes', 'data', 'assets'];

export default async function CocyRenderJSON(
	instance: Cocy,
	options: Options = {}
): Promise<void> {
	const outDir = path.resolve(instance.cwd, options.outDir ?? 'cocy');
	const fields: CocyFileFields = options.fields ?? defaultFields;

	if (options.clean) {
		fs.rmdir(outDir, { recursive: true });
	}

	instance.on('fileAdded', renderFile);
	instance.on('fileUpdated', renderFile);
	instance.on('fileRemoved', removeFile);

	function determineLocation(file: CocyFile) {
		const { dir } = path.parse(file.path.relative);

		const folder = path.resolve(outDir, dir);
		const filepath = path.resolve(folder, `${file.path.name}.json`);

		return { folder, filepath };
	}

	async function renderFile(file: CocyFile) {
		const picked = fields.reduce((obj, key) => {
			obj[key] = file[key];
			return obj;
		}, {} as Record<string, any>);

		const json = JSON.stringify(picked, (_, value) =>
			value instanceof Map ? mapToObj(value) : value
		);

		const { folder, filepath } = determineLocation(file);
		await fs.mkdir(folder, { recursive: true });
		await fs.writeFile(filepath, json);
	}

	function removeFile(file: CocyFile) {
		try {
			const { filepath } = determineLocation(file);
			fs.unlink(filepath);
		} catch {} // eslint-disable-line no-empty
	}
}
