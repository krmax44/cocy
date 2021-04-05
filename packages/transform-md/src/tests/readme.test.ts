import Cocy from 'cocy';
import md from '..';
import path from 'path';

const cwd = path.join(__dirname, 'fixtures', 'readme');

describe('readme example', () => {
	test('example works', async () => {
		expect.assertions(2);

		const cocy = new Cocy({ cwd }).use(md);
		await cocy.process();

		const logs = [];
		for (const file of cocy.files.values()) {
			logs.push(file.slug);
		}

		expect(logs).toEqual(['hello-world', 'second-post']);

		const { data } = cocy.files.getByPath('posts', 'Hello-World.md');
		expect(data.html).toBe('<p>Hey!</p>\n');
	});
});
