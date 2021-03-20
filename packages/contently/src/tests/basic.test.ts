import path from 'path';
import fs from 'fs/promises';
import Contently from '..';
import wait from 'waait';

const FIXTURE_ROOT = path.join(__dirname, 'fixture-basic');
const TEST_FILE = path.join(FIXTURE_ROOT, 'test.md');

const TEST_FOLDER = path.join(FIXTURE_ROOT, 'folder');
const TEST_FILE_DEEP = path.join(TEST_FOLDER, 'inner.md');

function makeInstance() {
	return new Contently({ cwd: FIXTURE_ROOT });
}

describe('basic tests', () => {
	const contently = makeInstance();
	contently.startWatcher();

	test('finds all files', async () => {
		await fs.mkdir(TEST_FOLDER);
		await fs.writeFile(TEST_FILE_DEEP, '');

		await contently.find();
		const file = contently.files.get(TEST_FILE);

		expect(file.path).toBe(TEST_FILE);
		expect(file.raw).toBe('Test!\n');
		expect(file.slug).toBe('test');
		expect(contently.files.has(TEST_FILE_DEEP)).toBe(true);
	});

	const TEST_FILE_2 = path.join(FIXTURE_ROOT, 'test-2.tmp.md');
	const TEST_CONTENT = 'Test!';

	test('watches file', async () => {
		await fs.writeFile(TEST_FILE_2, TEST_CONTENT);
		await wait(100);

		const file = contently.files.get(TEST_FILE_2);

		expect(file?.path).toEqual(TEST_FILE_2);
		expect(file?.raw).toEqual(TEST_CONTENT);

		await fs.unlink(TEST_FILE_2);
		await wait(200);

		expect(contently.files.has(TEST_FILE_2)).toBe(false);
	});

	test('removes folder', async () => {
		await fs.rmdir(TEST_FOLDER, { recursive: true });
		await wait(200);

		expect(contently.files.has(TEST_FILE_DEEP)).toBe(false);
	});

	afterAll(() => {
		contently.stopWatcher();
	});
});
