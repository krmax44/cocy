import path from 'path';
import fs from 'fs/promises';
import Cocy from 'cocy';
import renderJSON from '..';

const cwd = path.resolve(__dirname, 'fixture-2');

describe('render JSON', () => {
	const cocy = new Cocy({ cwd, patterns: ['**/*.md'] }).use(renderJSON, {
		outDir: './cocy.tmp/',
		transformer(file) {
			return { foo: 1, slug: file.slug };
		},
		indexGenerator(instance) {
			return { total: instance.files.size };
		},
		clean: true
	});
	const outDir = path.join(cwd, 'cocy.tmp');

	test('renders all files', async () => {
		expect.assertions(3);

		await cocy.discover();

		const outfile1 = path.join(outDir, 'test.json');

		const json1 = await fs.readFile(outfile1, { encoding: 'utf-8' });
		const data1 = JSON.parse(json1);

		expect(data1.slug).toBe('test');
		expect(data1.foo).toBe(1);

		// index
		const INDEX_FILE = path.join(outDir, '_index.json');

		const json2 = await fs.readFile(INDEX_FILE, { encoding: 'utf-8' });
		const data2 = JSON.parse(json2);

		expect(data2.total).toBe(1);
	});

	afterAll(() => {
		cocy.stopWatcher();
		fs.rm(outDir, { recursive: true });
	});
});
