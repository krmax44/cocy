import Contently from 'contently';
import ContentlyTransformMarkdown from 'contently-transform-markdown';

describe('readme example', () => {
	test('example works', async () => {
		const contently = await new Contently({
			patterns: ['./fixture-readme/**/*.md'],
			cwd: __dirname
		})
			.use(ContentlyTransformMarkdown)
			.find();

		const logs = [];
		for (const file of contently.files.values()) {
			logs.push(file.slug);
		}

		expect(logs).toEqual(['hello-world', 'second-post']);
	});
});
