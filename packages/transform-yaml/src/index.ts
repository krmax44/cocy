import yaml from 'yaml';
import Contently, { ContentlyFile } from 'contently';

export default async function ContentlyTransformMarkdown(
	instance: Contently
): Promise<void> {
	async function process(file: ContentlyFile): Promise<void> {
		if (file.mimeType !== 'text/yaml') return;

		if (file.raw) {
			const parsed = yaml.parse(file.raw);
			file.data = parsed;
		}
	}

	instance.on('fileAdded', process);
	instance.on('fileUpdated', process);
}
