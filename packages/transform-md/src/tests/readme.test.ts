import Cocy from 'cocy';
import CocyTransformMarkdown from '..';

describe('readme example', () => {
	test('example works', async () => {
		const cocy = await new Cocy({
			patterns: ['./fixtures/readme/*.md'],
			cwd: __dirname
		})
			.use(CocyTransformMarkdown)
			.discover();

		const logs = [];
		for (const file of cocy.files.values()) {
			logs.push(file.slug);
		}

		expect(logs).toEqual(['hello-world', 'second-post']);
	});
});
