import path from 'path';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import Cocy from 'cocy';
import renderJSON from '..';
import wait from 'waait';

const cwd = path.resolve(__dirname, 'fixture');

// TODO: more extensive tests

describe('render JSON', () => {
	const cocy = new Cocy({ cwd, watch: true, patterns: ['**/*.md'] }).use(
		renderJSON,
		{
			outDir: './cocy.tmp/',
			fields: ['raw', 'assets', 'path'],
			clean: true
		}
	);
	const outDir = path.join(cwd, 'cocy.tmp');

	test('renders all files', async () => {
		expect.assertions(5);

		await cocy.discover();

		const outfile = path.join(outDir, 'test.json');

		const json = await fs.readFile(outfile, { encoding: 'utf-8' });
		const data = JSON.parse(json);

		expect(data.raw).toBe('test\n');
		expect(data.slug).toBe(undefined);
		expect(data.attributes).toBe(undefined);
		expect(data.path.absolute).toBe(path.join(cwd, 'test.md'));
		expect(data.assets).toEqual({});
	});

	const TEST_FILE = path.join(cwd, 'test-2.tmp.md');
	const TEST_CONTENT = 'Test!';

	test('watches files', async () => {
		expect.assertions(2);
		await fs.writeFile(TEST_FILE, TEST_CONTENT);
		await wait(500);

		const outfile = path.join(outDir, 'test-2.tmp.json');

		const json = await fs.readFile(outfile, { encoding: 'utf-8' });
		const data = JSON.parse(json);

		expect(data.raw).toBe(TEST_CONTENT);

		await fs.unlink(TEST_FILE);
		await wait(200);

		expect(existsSync(TEST_FILE)).toBe(false);
	});

	afterAll(() => {
		cocy.stopWatcher();
	});
});
