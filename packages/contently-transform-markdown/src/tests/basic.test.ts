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

		expect(contently.files.get(first).data).toBe(`<h1>Hello World</h1>
<p>Hello from Contently!</p>
<!-- more -->
<p>Lorem ipsum</p>
<p><img src="/home/max/Dokumente/Projects/contently-new/packages/contently-transform-markdown/src/tests/fixtures/basic/Hello-World.md/test.png" alt="Image"></p>\n`);
	});
});
