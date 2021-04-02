import Cocy from 'cocy';
import md from '..';

describe('readme example', () => {
	test('example works', async () => {
		const cocy = new Cocy({
			patterns: ['./fixtures/readme/*.md'],
			cwd: __dirname
		}).use(md);
		await cocy.discover();

		const logs = [];
		for (const file of cocy.files.values()) {
			logs.push(file.slug);
		}

		expect(logs).toEqual(['hello-world', 'second-post']);
	});
});
