import path from 'path';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import Contently from 'contently';
import renderJSON from '..';
import wait from 'waait';

const cwd = path.resolve(__dirname, 'fixture', 'input');

// TODO: more extensive tests

describe('render JSON', () => {
	const contently = new Contently({ cwd, watch: true }).use(renderJSON, {
		outDir: '../contently.tmp/',
		fields: ['raw', 'attributes', 'assets', 'path']
	});
	const outDir = path.join(cwd, '..', 'contently.tmp');

	test('renders all files', async () => {
		await contently.find();
		await wait(200);

		const outfile = path.join(outDir, 'test.json');

		const json = await fs.readFile(outfile, { encoding: 'utf-8' });
		const data = JSON.parse(json);

		expect(data.raw).toBe('test\n');
		expect(data.slug).toBe(undefined);
		expect(data.path).toBe(path.join(cwd, 'test.md'));
		expect(data.attributes).toEqual({});
		expect(data.assets).toEqual({});
	});

	const TEST_FILE = path.join(cwd, 'test-2.tmp.md');
	const TEST_CONTENT = 'Test!';

	test('watches files', async () => {
		await fs.writeFile(TEST_FILE, TEST_CONTENT);
		await wait(200);

		const outfile = path.join(cwd, '..', 'contently.tmp', 'test-2.tmp.json');

		const json = await fs.readFile(outfile, { encoding: 'utf-8' });
		const data = JSON.parse(json);

		expect(data.raw).toBe(TEST_CONTENT);

		await fs.unlink(TEST_FILE);
		await wait(200);

		expect(existsSync(TEST_FILE)).toBe(false);
	});

	afterAll(() => {
		contently.stopWatcher();
		fs.rm(outDir, { recursive: true });
	});
});
