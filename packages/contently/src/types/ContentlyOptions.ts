import { Transformer } from './Transformer';
import { Sourcer } from './Sourcer';
import { Writer } from './Writer';

export interface ContentlyOptions {
	sourcer: Sourcer;
	transformer: Transformer;
	writer: Writer;
	slugify?: (input: string) => string;
}
