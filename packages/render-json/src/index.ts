import fs from 'fs/promises';
import path from 'path';

import type Cocy from 'cocy';
import type { CocyFile } from 'cocy';
import { CocyFileFields, DestLocation, Options } from './types';

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
		fs.rm(outDir, { recursive: true }).catch(() => 0);
	}

	instance.on('fileAdded', renderFile);
	instance.on('fileUpdated', renderFile);
	instance.on('fileRemoved', removeFile);
	instance.on('afterProcess', renderIndex);

	function determineLocation(file: CocyFile): DestLocation {
		const { dir } = path.parse(file.path.relative);

		const folder = path.resolve(outDir, dir);
		const filepath = path.resolve(folder, `${file.path.name}.json`);

		return { folder, filepath };
	}

	async function renderFile(file: CocyFile) {
		let picked;

		if (options.transformer) {
			picked = await Promise.resolve(options.transformer(file, instance));
		} else {
			picked = fields.reduce((obj, key) => {
				obj[key] = file[key];
				return obj;
			}, {} as Record<string, any>);
		}

		if (picked === undefined) return;

		const json = JSON.stringify(picked, (_, value) =>
			value instanceof Map ? mapToObj(value) : value
		);

		const { folder, filepath } = determineLocation(file);
		await fs.mkdir(folder, { recursive: true });
		await fs.writeFile(filepath, json);
	}

	async function renderIndex() {
		const data = await Promise.resolve(
			options.indexGenerator?.(instance, determineLocation)
		);

		if (data) {
			const dest = path.resolve(outDir, options.indexFile ?? '_index.json');
			await fs.writeFile(dest, JSON.stringify(data));
		}
	}

	function removeFile(file: CocyFile) {
		try {
			const { filepath } = determineLocation(file);
			fs.unlink(filepath);
		} catch {} // eslint-disable-line no-empty
	}
}
