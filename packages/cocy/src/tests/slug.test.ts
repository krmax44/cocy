import path from 'path';
import Cocy from '..';

const FIXTURE_ROOT = path.join(__dirname, 'fixture-2');
const TEST_FILE_1 = path.join(FIXTURE_ROOT, 'test.md');
const TEST_FILE_2 = path.join(FIXTURE_ROOT, 'file-2.md');

describe('slug generation', () => {
	const cocy = new Cocy({ cwd: FIXTURE_ROOT, patterns: ['**/*.md'] });

	test('finds all files', async () => {
		await cocy.discover();
		const file1 = cocy.files.get(TEST_FILE_1);
		const file2 = cocy.files.get(TEST_FILE_2);
		const slug1 = file1.setSlug('test');
		const slug2 = file2.setSlug('test');

		expect(file1.slug).toBe('test');
		expect(file2.slug).toBe('test-1');
		expect(slug1).toBe('test');
		expect(slug2).toBe('test-1');
	});
});
