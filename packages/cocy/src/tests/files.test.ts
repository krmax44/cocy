import path from 'path';
import Cocy from '..';

const FIXTURE_ROOT = path.join(__dirname, 'fixture-2');
const TEST_FILE = path.join(FIXTURE_ROOT, 'test.md');

describe('CocyFiles', () => {
	const cocy = new Cocy({ cwd: FIXTURE_ROOT, patterns: ['**.md'] });

	test('get file using utils', async () => {
		expect.assertions(7);
		await cocy.process();

		expect(cocy.files.getByPath('test.md').path.absolute).toBe(TEST_FILE);
		expect(cocy.files.getByRoute('test').path.absolute).toBe(TEST_FILE);

		expect(cocy.files.getByRoute('deep/test').slug).toBe('test');
		expect(cocy.files.getByRoute('deep', 'test').slug).toBe('test');
		expect(cocy.files.getByPath('deep', 'test.md').slug).toBe('test');
		expect(cocy.files.getByPath('deep/test.md').slug).toBe('test');

		const files = cocy.files.getInDir('.');
		expect(files.length).toBeGreaterThanOrEqual(2);
	});
});
