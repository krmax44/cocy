import yaml from 'yaml';
import Cocy, { CocyFile } from 'cocy';

export type CocyFileYaml = CocyFile<Record<string, any>>;

export default async function CocyTransformMarkdown(
	instance: Cocy
): Promise<void> {
	async function process(file: CocyFile): Promise<void> {
		if (file.mimeType !== 'text/yaml') return;

		if (file.raw) {
			const parsed = yaml.parse(file.raw);
			file.data = parsed;
		}
	}

	instance.on('fileAdded', process);
	instance.on('fileUpdated', process);
}
