import { Sourcer, Writer, Transformer, ContentlyOptions } from './types';

export class Contently {
	public sourcer: Sourcer;

	public transformer: Transformer;

	public writer: Writer;

	constructor(options: ContentlyOptions) {
		this.sourcer = options.sourcer;
		this.transformer = options.transformer;
		this.writer = options.writer;
	}

	async run() {
		const sources = await Promise.resolve(this.sourcer.source());

		const writerQueue: Array<Promise<any>> = [];
		for (const source of sources) {
			Promise.resolve(this.transformer.transform(source)).then(transfomed => {
				writerQueue.push(
					Promise.resolve(this.writer.write(source, transfomed))
				);
			});
		}

		return Promise.all(writerQueue);
	}
}
