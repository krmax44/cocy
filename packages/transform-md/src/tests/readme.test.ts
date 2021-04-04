import Cocy from 'cocy';
import md from '..';

describe('readme example', () => {
	test('example works', async () => {
		expect.assertions(2);

		const cocy = new Cocy({
			patterns: ['./fixtures/readme/*.md'],
			cwd: __dirname
		}).use(md);
		await cocy.process();

		const logs = [];
		for (const file of cocy.files.values()) {
			logs.push(file.slug);
		}

		expect(logs).toEqual(['hello-world', 'second-post']);

		const { data } = cocy.files.getBySlug('hello-world');
		expect(data.html).toBe('<p>Hey!</p>\n');
	});
});
