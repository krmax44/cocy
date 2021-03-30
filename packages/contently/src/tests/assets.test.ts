import path from 'path';
import Contently from '..';

const FIXTURE_ROOT = path.join(__dirname, 'fixture-basic');
const TEST_FILE = path.join(FIXTURE_ROOT, 'test.md');

function makeInstance() {
	return new Contently({ cwd: FIXTURE_ROOT });
}

describe('assets', () => {
	test('finds all files', async () => {
		const contently = makeInstance();
		await contently.discover();

		contently.on('assetAdded', resolve => resolve('resolved'));

		const file = contently.files.get(TEST_FILE);

		const asset = await file.resolveAsset('foo.png');
		expect(asset).toBe('resolved');
		expect(file.assets.size).toBe(0);
	});

	test('adds keyed assets', async () => {
		const contently = makeInstance();
		await contently.discover();

		contently.on('assetAdded', resolve => resolve('resolved'));

		const file = contently.files.get(TEST_FILE);

		await file.resolveAsset('foo.png', 'key');
		expect(file.assets.size).toBe(1);
		expect(file.assets.get('key')).toBe('resolved');
	});

	test('deals with no resolver', async () => {
		const contently = makeInstance();
		await contently.discover();

		const file = contently.files.get(TEST_FILE);

		const asset = await file.resolveAsset('foo.png', 'key');
		expect(asset).toBe('foo.png');
	});
});
