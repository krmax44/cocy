import yaml from 'yaml';
import Contently, { ContentlyFile } from 'contently';

export default async function ContentlyTransformMarkdown(
	instance: Contently
): Promise<void> {
	async function process(file: ContentlyFile): Promise<void> {
		const parsed = yaml.parse(file.raw);
		file.data = parsed;
	}

	instance.on('fileAdded', process);
	instance.on('fileUpdated', process);
}
