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
		await contently.find();

		contently.on('assetAdded', resolve => resolve('resolved'));

		const file = contently.files.get(TEST_FILE);

		const asset = await contently.resolveAsset('foo.png', file);
		expect(asset).toBe('resolved');
		expect(file.assets.size).toBe(0);
	});

	test('adds keyed assets', async () => {
		const contently = makeInstance();
		await contently.find();

		contently.on('assetAdded', resolve => resolve('resolved'));

		const file = contently.files.get(TEST_FILE);

		await contently.resolveAsset('foo.png', file, 'key');
		expect(file.assets.size).toBe(1);
		expect(file.assets.get('key')).toBe('resolved');
	});

	test('deals with no resolver', async () => {
		const contently = makeInstance();
		await contently.find();

		const file = contently.files.get(TEST_FILE);

		const asset = await contently.resolveAsset('foo.png', file, 'key');
		expect(asset).toBe('foo.png');
	});
});
