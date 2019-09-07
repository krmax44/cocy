import path from 'path';
import { expect } from 'chai';
import { Contently } from 'contently';
import ContentlySourceFs from '../../../contently-source-fs/src';
import ContentlyTransformMarkdown from '..';
import 'mocha';

describe('basic markdown transform', () => {
	it('should source all files', async () => {
		const cwd = path.join(__dirname, '../../../../tests/fixtures/basic/');
		const contently = new Contently({ cwd })
			.use(ContentlySourceFs)
			.use(ContentlyTransformMarkdown);
		const { results } = await contently.run();

		expect(results).to.eql([
			{
				id: path.join(cwd, 'Hello-World.md'),
				slug: 'hello-world',
				attributes: { ...results[0].attributes, title: 'Hello-World' },
				data: '<h1>Hello World</h1>\n<p>Hello from Contently!</p>\n',
				assets: []
			},
			{
				id: path.join(cwd, 'Second-Post.md'),
				slug: 'second-post',
				attributes: { ...results[1].attributes, title: 'Second-Post' },
				data: '<h1>Second Post</h1>\n<p>This is the second post!</p>\n',
				assets: []
			}
		]);
	});
});
