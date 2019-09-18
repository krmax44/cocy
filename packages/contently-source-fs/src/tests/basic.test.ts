import path from 'path';
import { expect } from 'chai';
import { Contently } from 'contently';
import ContentlySourceFs from '..';
import 'mocha';

describe('basic sourcing', () => {
	it('should source all files', async () => {
		const cwd = path.join(__dirname, 'fixtures/basic/');
		const contently = new Contently({ cwd }).use(ContentlySourceFs);
		const { results } = await contently.run();

		expect(results).to.eql([
			{
				id: path.join(cwd, 'Hello-World.md'),
				slug: 'hello-world',
				attributes: {
					createdAt: new Date('2019-09-06T11:49:17.000Z'),
					modifiedAt: new Date('2019-09-15T12:53:45.000Z'),
					title: 'Hello-World'
				},
				data: '# Hello World\n\nHello from Contently!\n',
				assets: {}
			},
			{
				id: path.join(cwd, 'Second-Post.md'),
				slug: 'second-post',
				attributes: {
					createdAt: new Date('2019-09-06T11:49:17.000Z'),
					modifiedAt: new Date('2019-09-15T12:53:45.000Z'),
					title: 'Second-Post'
				},
				data: '# Second Post\n\nThis is the second post!\n',
				assets: {}
			}
		]);
	});
});
