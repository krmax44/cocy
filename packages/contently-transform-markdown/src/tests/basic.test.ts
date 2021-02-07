import path from 'path';
import Contently from 'contently';
import ContentlyTransformMarkdown from '../ContentlyTransformMarkdown';

describe('ContentlyTransformMarkdown', () => {
	it('should transform all files', async () => {
		const cwd = path.join(__dirname, 'fixtures/basic/');
		const contently = new Contently({ cwd }).use(ContentlyTransformMarkdown);
		await contently.find();

		const first = path.join(cwd, 'Hello-World.md');
		const second = path.join(cwd, 'Second-Post.md');
		const third = path.join(cwd, 'Third-Post.md');

		const secondFile = contently.files.get(second);
		expect(secondFile.data).toBe(
			'<h1>Second Post</h1>\n<p>This is the second post!</p>\n'
		);
		expect(secondFile.attributes.excerpt).toBe('Second post!');
	});
});
