import path from 'path';
import Contently from 'contently';
import ContentlyTransformMarkdown from '../ContentlyTransformMarkdown'
import { contents } from 'vfile';

describe('ContentlyTransformMarkdown', () => {
	it('should transform all files', async () => {
		const cwd = path.join(__dirname, 'fixtures/basic/');
		const contently = new Contently({ cwd })
			.use(ContentlyTransformMarkdown);
		await contently.find();

    console.log(contently.files)
    expect(contently.files.size).toBe(3)
	});
});
