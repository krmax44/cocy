import Contently from 'contently';
import ContentlyTransformMarkdown from '..';

describe('readme example', () => {
	test('example works', async () => {
		const contently = await new Contently({
			patterns: ['./fixtures/readme/*.md'],
			cwd: __dirname
		})
			.use(ContentlyTransformMarkdown)
			.discover();

		const logs = [];
		for (const file of contently.files.values()) {
			logs.push(file.slug);
		}

		expect(logs).toEqual(['hello-world', 'second-post']);
	});
});
