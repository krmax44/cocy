import path from 'path';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import Contently from 'contently';
import ContentlyRenderJSON from '../ContentlyRenderJSON';
import wait from 'waait';

const cwd = path.resolve(__dirname, 'fixture', 'input');

// TODO: more extensive tests

describe('ContentlyRenderJSON', () => {
	const contently = new Contently({ cwd, watch: true }).use(
		ContentlyRenderJSON
	);

	test('renders all files', async () => {
		await contently.find();
		const outfile = path.join(cwd, '..', 'contently', 'test.json');

		const json = await fs.readFile(outfile, { encoding: 'utf-8' });
		const data = JSON.parse(json);

		expect(data.data).toBe('test\n');
		expect(data.slug).toBe('test');
		expect(data.path).toBe(path.join(cwd, 'test.md'));
	});

	const TEST_FILE = path.join(cwd, 'test-2.tmp.md');
	const TEST_CONTENT = 'Test!';

	test('watches files', async () => {
		await fs.writeFile(TEST_FILE, TEST_CONTENT);
		await wait(100);

		const outfile = path.join(cwd, '..', 'contently', 'test-2.tmp.json');

		const json = await fs.readFile(outfile, { encoding: 'utf-8' });
		const data = JSON.parse(json);

		expect(data.data).toBe(TEST_CONTENT);

		await fs.unlink(TEST_FILE);
		await wait(200);

		expect(existsSync(TEST_FILE)).toBe(false);
	});

	afterAll(() => {
		contently.stopWatcher();
	});
});
