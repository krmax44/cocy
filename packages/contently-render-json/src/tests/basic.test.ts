import path from 'path';
import fs from 'fs/promises';
import Contently from 'contently';
import ContentlyRenderJSON from '../ContentlyRenderJSON';
import wait from 'waait';

const cwd = path.resolve(__dirname, 'fixture', 'input');

// TODO: more extensive tests

describe('ContentlyRenderJSON', () => {
	test('renders all files', async () => {
		const contently = new Contently({ cwd }).use(ContentlyRenderJSON);
		await contently.find();

		await wait(200);

		const outfile = path.join(cwd, '..', 'contently', 'test.json');

		const json = await fs.readFile(outfile, { encoding: 'utf-8' });

		const data = JSON.parse(json);

		expect(data.data).toBe('test\n');
		expect(data.slug).toBe('test');
		expect(data.path).toBe(path.join(cwd, 'test.md'));
	});
});
