import path from 'path';
import Contently from '..';

const FIXTURE_ROOT = path.join(__dirname, 'fixture-basic');
const TEST_FILE_1 = path.join(FIXTURE_ROOT, 'test.md');
const TEST_FILE_2 = path.join(FIXTURE_ROOT, 'file-2.md');

describe('slug generation', () => {
	const contently = new Contently({ cwd: FIXTURE_ROOT });

	test('finds all files', async () => {
		await contently.discover();
		const file1 = contently.files.get(TEST_FILE_1);
		const file2 = contently.files.get(TEST_FILE_2);
		const slug1 = file1.setSlug('test');
		const slug2 = file2.setSlug('test');

		expect(file1.slug).toBe('test');
		expect(file2.slug).toBe('test-1');
		expect(slug1).toBe('test');
		expect(slug2).toBe('test-1');
	});
});
