import { expect } from 'chai';
import { Contently, ContentlyResult } from '..';
import 'mocha';

function randomString(): string {
	return Math.random()
		.toString(36)
		.substring(2);
}

function generateResult(): ContentlyResult {
	return new ContentlyResult({
		id: randomString(),
		attributes: {
			createdAt: new Date(),
			modifiedAt: new Date(),
			title: randomString()
		},
		slug: randomString(),
		data: randomString()
	});
}

describe('beforeAddResult hook', () => {
	it('should hook into the result', async () => {
		const contently = new Contently();

		contently.on('beforeAddResult', (result: ContentlyResult) => {
			result.attributes.title = 'hooked';
			return result;
		});

		contently.on('beforeAddResult', function(result: ContentlyResult) {
			result.attributes.title += '!';
			result.attributes.cwd = (this as Contently).options.cwd;
			return result;
		});

		await contently.addResult(generateResult());

		expect(contently.results[0].attributes.title).to.equal('hooked!');
		expect(contently.results[0].attributes.cwd).to.equal(contently.options.cwd);
	});
});
