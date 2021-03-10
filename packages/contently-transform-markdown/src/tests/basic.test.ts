import path from 'path';
import Contently from 'contently';
import ContentlyTransformMarkdown from '../ContentlyTransformMarkdown';

describe('ContentlyTransformMarkdown', () => {
	it('should transform all files', async () => {
		const cwd = path.join(__dirname, 'fixtures/basic/');

		const contently = new Contently({ cwd }).use(ContentlyTransformMarkdown);

		contently.on('assetAdded', resolve => resolve('foo'));

		await contently.find();

		const first = path.join(cwd, 'Hello-World.md');
		const second = path.join(cwd, 'Second-Post.md');

		const firstFile = contently.files.get(first);
		const secondFile = contently.files.get(second);

		expect(firstFile.data).toBe(
			'<h1>Hello World</h1>\n' +
				'<p>Hello from Contently!</p>\n' +
				'<!-- more -->\n' +
				'<p>Lorem ipsum</p>\n' +
				'<p><img src="foo" alt="Image"></p>\n'
		);

		expect(secondFile.data).toBe(
			'<h1>Second Post</h1>\n<p>This is the second post!</p>\n'
		);
		expect(secondFile.attributes.excerpt).toBe('Second post!');
		expect(secondFile.assets.get('cover')).toBe('foo');
	});
});
