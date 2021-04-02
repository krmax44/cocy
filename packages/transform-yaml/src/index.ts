import yaml from 'yaml';
import Cocy, { CocyFile } from 'cocy';

export default async function CocyTransformYaml(instance: Cocy): Promise<void> {
	if (instance.patterns.length === 0) {
		instance.patterns.push('**/*.{yml,yaml}');
	}

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
