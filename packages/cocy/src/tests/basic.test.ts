import path from 'path';
import fs from 'fs/promises';
import Cocy from '..';
import wait from 'waait';
import n from '../utils/n';

const FIXTURE_ROOT = path.join(__dirname, 'fixture-1');
const TEST_FILE = path.join(FIXTURE_ROOT, 'test.md');

const TEST_FILE_2 = path.join(FIXTURE_ROOT, 'test-2.tmp.md');
const TEST_CONTENT = 'Test!';

const TEST_FOLDER = path.join(FIXTURE_ROOT, 'folder');
const TEST_FILE_DEEP = path.join(TEST_FOLDER, 'inner.md');

describe('basic tests', () => {
	test('finds all files', async () => {
		expect.assertions(10);

		await fs.mkdir(TEST_FOLDER);
		await fs.writeFile(TEST_FILE_DEEP, '');

		const cocy = new Cocy({
			cwd: FIXTURE_ROOT,
			watch: true,
			patterns: ['**/*.md']
		});

		await cocy.process();
		const file = cocy.files.get(TEST_FILE);

		expect(file.path.absolute).toBe(TEST_FILE);
		expect(file.raw).toBe('Test!\n');
		expect(file.route).toEqual(['test']);

		expect(file.slug).toBe('test');
		expect(cocy.files.has(TEST_FILE_DEEP)).toBe(true);

		expect(cocy.files.get(TEST_FILE_DEEP).route).toEqual(['folder', 'inner']);

		await fs.writeFile(TEST_FILE_2, TEST_CONTENT);
		await wait(100);

		const file2 = cocy.files.get(TEST_FILE_2);

		expect(file2.path.absolute).toEqual(TEST_FILE_2);
		expect(file2.raw).toEqual(TEST_CONTENT);

		await fs.unlink(TEST_FILE_2);
		await wait(200);

		expect(cocy.files.has(TEST_FILE_2)).toBe(false);

		await fs.rm(TEST_FOLDER, { recursive: true }).catch(n);
		await wait(200);

		expect(cocy.files.has(TEST_FILE_DEEP)).toBe(false);
		cocy.stopWatcher();
	});

	afterAll(() => {
		fs.rm(TEST_FOLDER, { recursive: true }).catch(n);
		fs.rm(TEST_FILE_2).catch(n);
	});
});
