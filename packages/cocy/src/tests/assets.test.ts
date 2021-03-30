import path from 'path';
import Cocy from '..';

const FIXTURE_ROOT = path.join(__dirname, 'fixture-basic');
const TEST_FILE = path.join(FIXTURE_ROOT, 'test.md');

function makeInstance() {
	return new Cocy({ cwd: FIXTURE_ROOT });
}

describe('assets', () => {
	test('finds all files', async () => {
		const cocy = makeInstance();
		await cocy.discover();

		cocy.on('assetAdded', resolve => resolve('resolved'));

		const file = cocy.files.get(TEST_FILE);

		const asset = await file.resolveAsset('foo.png');
		expect(asset).toBe('resolved');
		expect(file.assets.size).toBe(0);
	});

	test('adds keyed assets', async () => {
		const cocy = makeInstance();
		await cocy.discover();

		cocy.on('assetAdded', resolve => resolve('resolved'));

		const file = cocy.files.get(TEST_FILE);

		await file.resolveAsset('foo.png', 'key');
		expect(file.assets.size).toBe(1);
		expect(file.assets.get('key')).toBe('resolved');
	});

	test('deals with no resolver', async () => {
		const cocy = makeInstance();
		await cocy.discover();

		const file = cocy.files.get(TEST_FILE);

		const asset = await file.resolveAsset('foo.png', 'key');
		expect(asset).toBe('foo.png');
	});
});
