import path from 'path';
import Cocy from '..';

const FIXTURE_ROOT = path.join(__dirname, 'fixture-2');

describe('slug generation', () => {
	const cocy = new Cocy({ cwd: FIXTURE_ROOT, patterns: ['**/*.md'] });

	test('finds all files', async () => {
		await cocy.process();
		const file1 = cocy.files.getByPath('test.md');
		const file2 = cocy.files.getByPath('file-2.md');
		const file3 = cocy.files.getByPath('deep', 'test.md');

		const slug1 = file1.setSlug('test');
		const slug2 = file2.setSlug('test');

		expect(file1.slug).toBe('test');
		expect(file2.slug).toBe('test-1');
		expect(slug1).toBe('test');
		expect(slug2).toBe('test-1');

		expect(file3.slug).toBe('test');
	});
});
