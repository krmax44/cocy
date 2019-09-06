import { join } from 'path';
import { readJson } from 'fs-extra';
import { expect } from 'chai';
import { Contently } from 'contently';
import ContentlySourceFs from '../../../contently-source-fs/src';
import ContentlyTransformMarkdown from '../../../contently-transform-markdown/src';
import ContentlyJsonApi from '..';
import 'mocha';

describe('basic json api', () => {
	it('should output all files', async () => {
		const cwd = join(__dirname, '../../../../tests/fixtures/basic/');
		const contently = new Contently({ cwd })
			.use(ContentlySourceFs)
			.use(ContentlyTransformMarkdown)
			.use(ContentlyJsonApi, {
				output: 'output/'
			});

		const { results } = await contently.run();

		const readFile = async (file: string): Promise<any> =>
			readJson(join(cwd, 'output/', `${file}.json`));

		const [first, second] = await Promise.all([
			readFile('hello-world'),
			readFile('second-post')
		]);

		const compareable = (i: number): any =>
			JSON.parse(JSON.stringify({ ...results[i], id: undefined }));

		expect(compareable(0)).to.eql(first);
		expect(compareable(1)).to.eql(second);
	});
});
