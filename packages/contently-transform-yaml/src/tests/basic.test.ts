import path from 'path';
import Contently from 'contently';
import ContentlyTransformYaml from '../ContentlyTransformYaml';

describe('ContentlyTransformYaml', () => {
	it('should transform all files', async () => {
		const cwd = path.join(__dirname, 'fixtures/basic/');

		const contently = new Contently({ cwd, patterns: ['*.yml'] }).use(
			ContentlyTransformYaml
		);

		await contently.find();

		const first = path.join(cwd, 'first.yml');

		const firstFile = contently.files.get(first);

		expect(firstFile.data).toEqual({ foo: 'bar' });
	});
});
