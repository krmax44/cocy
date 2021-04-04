import path from 'path';
import Cocy from 'cocy';
import yaml from '..';

describe('transform YAML', () => {
	it('should transform all files', async () => {
		const cwd = path.join(__dirname, 'fixtures/basic/');

		const cocy = new Cocy({ cwd }).use(yaml);

		await cocy.process();

		const first = path.join(cwd, 'first.yml');

		const { data } = cocy.files.get(first);

		expect(data).toEqual({ foo: 'bar' });
	});
});
