import path from 'path';
import Cocy from '..';

const FIXTURE_ROOT = path.join(__dirname, 'fixture-basic');
const TEST_FILE = path.join(FIXTURE_ROOT, 'test.md');

describe('CocyFiles', () => {
	const cocy = new Cocy({ cwd: FIXTURE_ROOT, patterns: ['*.md'] });

	test('get file using utils', async () => {
		expect.assertions(3);
		await cocy.discover();

		const file1 = cocy.files.getBySlug('test');
		expect(file1.path.absolute).toBe(TEST_FILE);

		const file2 = cocy.files.getByPath('test.md');
		expect(file2.path.absolute).toBe(TEST_FILE);

		const files = cocy.files.getInDir('.');
		expect(files.length).toBeGreaterThanOrEqual(2);
	});
});
