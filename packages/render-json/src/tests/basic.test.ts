import path from 'path';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import Cocy from 'cocy';
import renderJSON from '..';
import wait from 'waait';

const cwd = path.resolve(__dirname, 'fixture-1');

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
		expect.assertions(7);

		await cocy.discover();

		const outfile1 = path.join(outDir, 'test.json');

		const json1 = await fs.readFile(outfile1, { encoding: 'utf-8' });
		const data1 = JSON.parse(json1);

		expect(data1.raw).toBe('test\n');
		expect(data1.slug).toBe(undefined);
		expect(data1.attributes).toBe(undefined);
		expect(data1.path.absolute).toBe(path.join(cwd, 'test.md'));
		expect(data1.assets).toEqual({});

		// file watching
		const TEST_FILE = path.join(cwd, 'test-2.tmp.md');
		const TEST_CONTENT = 'Test!';

		await fs.writeFile(TEST_FILE, TEST_CONTENT);
		await wait(500);

		const outfile2 = path.join(outDir, 'test-2.tmp.json');

		const json2 = await fs.readFile(outfile2, { encoding: 'utf-8' });
		const data2 = JSON.parse(json2);

		expect(data2.raw).toBe(TEST_CONTENT);

		await fs.unlink(TEST_FILE);
		await wait(200);

		expect(existsSync(TEST_FILE)).toBe(false);
	});

	afterAll(() => {
		cocy.stopWatcher();
		fs.rm(outDir, { recursive: true }).catch(() => 0);
	});
});
