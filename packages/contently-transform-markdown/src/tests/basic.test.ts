import path from 'path';
import { expect } from 'chai';
import { Contently } from 'contently';
import ContentlySourceFs from '../../../contently-source-fs/src';
import ContentlyTransformMarkdown from '..';
import 'mocha';

describe('basic markdown transform', () => {
	it('should transform all files', async () => {
		const cwd = path.join(__dirname, 'fixtures/basic/');
		const contently = new Contently({ cwd })
			.use(ContentlySourceFs)
			.use(ContentlyTransformMarkdown);
		const { results } = await contently.run();

		expect(results).to.eql([
			{
				id: path.join(cwd, 'Hello-World.md'),
				slug: 'hello-world',
				attributes: {
					createdAt: new Date('2019-09-06T11:49:17.000Z'),
					modifiedAt: new Date('2019-09-15T12:54:03.000Z'),
					title: 'Hello-World',
					excerpt: 'Hello from Contently!'
				},
				data:
					'<h1>Hello World</h1>\n<p>Hello from Contently!</p>\n<!-- more -->\n<p>Lorem ipsum</p>\n',
				assets: {}
			},
			{
				id: path.join(cwd, 'Second-Post.md'),
				slug: 'second-post',
				attributes: {
					createdAt: new Date('2019-09-15T12:54:03.000Z'),
					modifiedAt: new Date('2019-09-15T12:54:03.000Z'),
					title: 'Post no 2',
					excerpt: 'Second post!'
				},
				data: '<h1>Second Post</h1>\n<p>This is the second post!</p>\n',
				assets: {}
			},
			{
				id: path.join(cwd, 'Third-Post.md'),
				slug: 'third-post',
				attributes: {
					createdAt: new Date('2019-09-15T12:54:03.000Z'),
					modifiedAt: new Date('2019-09-15T12:54:03.000Z'),
					title: 'Third-Post',
					excerpt: 'So much content!'
				},
				data:
					'<h1>Third Post</h1>\n<p>So much content!</p>\n<p>I am amazed!</p>\n',
				assets: {}
			}
		]);
	});
});
