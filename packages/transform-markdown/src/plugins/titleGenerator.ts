/* Based on https://github.com/manovotny/remark-excerpt */

import { Node } from 'unist';
import { VFile } from 'vfile';
import type Contently from 'contently';
import type { ContentlyFile } from 'contently';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const find = require('unist-util-find');

type Options = {
	instance: Contently;
	file: ContentlyFile;
	title: boolean;
	slug: boolean;
};

function setTitle(title: string, options: Options) {
	if (options.title) options.file.attributes.title = title;
	if (options.slug) options.file.setSlug(title);
}

export function titleGenerator(options: Options): any {
	return async function (tree: Node, file: VFile) {
		let { title } = file.data as any;

		if (!title) {
			const firstHeading = find(tree, { type: 'heading', depth: 1 });
			title = firstHeading && find(firstHeading, { type: 'text' })?.value;
		}

		title && setTitle(title, options);
	};
}
