import fs from 'fs/promises';
import path from 'path';
import Cocy, { CocyFile } from 'cocy';

interface Options {
	/**
	 * Attributes, which should be rendered to JSON.
	 * @default slug,attributes,data,assets
	 */
	fields?: Array<keyof CocyFile>;

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

const defaultFields: Array<keyof CocyFile> = [
	'slug',
	'attributes',
	'data',
	'assets'
];

export default async function CocyRenderJSON(
	instance: Cocy,
	options: Options = {}
): Promise<void> {
	const outDir = path.resolve(
		instance.options.cwd,
		options.outDir ?? '../cocy'
	);
	const fields: string[] = options.fields ?? defaultFields;

	if (options.clean) {
		await fs.rmdir(outDir, { recursive: true });
		await fs.mkdir(outDir);
	}

	instance.on('fileAdded', renderFile);
	instance.on('fileUpdated', renderFile);
	instance.on('fileRemoved', removeFile);

	function determineLocation(file: CocyFile) {
		const relativePath = path.relative(instance.options.cwd, file.path);
		const { dir, name } = path.parse(relativePath);

		const folder = path.resolve(outDir, dir);
		const filepath = path.resolve(folder, `${name}.json`);

		return { folder, filepath };
	}

	async function renderFile(file: CocyFile) {
		const json = JSON.stringify(file, (key, value) => {
			if (!key) return value;
			if (!fields.includes(key)) return undefined;

			if (value instanceof Map) return mapToObj(value);
			return value;
		});

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
