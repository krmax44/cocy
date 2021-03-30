import path from 'path';
import Cocy from 'cocy';
import CocyTransformMarkdown, { CocyMdFile } from '..';

describe('transform markdown', () => {
	it('should transform all files', async () => {
		const cwd = path.join(__dirname, 'fixtures/basic/');

		const cocy = new Cocy({ cwd }).use(CocyTransformMarkdown);

		cocy.on('assetAdded', resolve => resolve('foo'));

		await cocy.discover();

		const first = path.join(cwd, 'Hello-World.md');
		const second = path.join(cwd, 'Second-Post.md');

		const firstFile: CocyMdFile = cocy.files.get(first);
		const secondFile: CocyMdFile = cocy.files.get(second);

		expect(firstFile.data.html).toBe(
			'<h1>Hello World</h1>\n' +
				'<p>Hello from Cocy!</p>\n' +
				'<!-- more -->\n' +
				'<p>Lorem ipsum</p>\n' +
				'<p><img src="foo" alt="Image"></p>\n'
		);
		expect(firstFile.attributes.title).toBe('Hello!');
		expect(firstFile.slug).toBe('hello');

		expect(secondFile.data.html).toBe(
			'<h1>Second Post Yeah</h1>\n<p>This is the second post!</p>\n'
		);
		expect(secondFile.attributes.excerpt).toBe('Second post!');
		expect(secondFile.attributes.title).toBe('Second Post Yeah');
		expect(secondFile.slug).toBe('second-post-yeah');
		expect(secondFile.assets.get('cover')).toBe('foo');
	});
});
