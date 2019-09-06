import path from 'path';
import { expect } from 'chai';
import { ContentlySourceFs } from '../ContentlySourceFs';
import 'mocha';

describe('basic sourcing', () => {
	it('should source all files', async () => {
		const cwd = path.join(__dirname, 'fixtures', 'basic');
		const sourceFs = new ContentlySourceFs(undefined, {
			cwd
		});
		const sources = await sourceFs.source();

		expect(sources).to.eql([
			{
				id: path.join(cwd, 'Hello-World.md'),
				slug: 'Hello-World',
				createdAt: new Date('2019-09-05T21:33:38.739Z'),
				modifiedAt: new Date('2019-09-05T21:33:38.739Z'),
				data: '# Hello World\n\nHello from Contently!\n'
			},
			{
				id: path.join(cwd, 'Second-Post.md'),
				slug: 'Second-Post',
				createdAt: new Date('2019-09-05T21:33:59.429Z'),
				modifiedAt: new Date('2019-09-05T21:33:59.429Z'),
				data: '# Second Post\n\nThis is the second post!\n'
			}
		]);
	});
});
