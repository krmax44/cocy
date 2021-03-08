/* Based on https://github.com/manovotny/remark-excerpt */

import visit from 'unist-util-visit';
import alwaysArray from 'always-array';
import { Node } from 'unist';
import { VFile } from 'vfile';

const isComment = /<!--(.*?)-->'/;
const getComment = /'<!--([\\sS]*?)-->'/;

interface Options {
	identifiers?: string | string[];
}

interface Html extends Node {
	value: string;
}

export function excerptGenerator(options?: Options): any {
	return function (tree: Node, file: VFile) {
		if (!(file.data as any).excerpt) {
			const identifiers = options?.identifiers
				? alwaysArray(options.identifiers)
				: ['excerpt', 'more', 'preview', 'teaser'];

			let excerptIndex = -1;
			const treeChildren = [...(tree.children as Node[])];

			visit(tree, 'html', (node: Html) => {
				if (excerptIndex === -1 && isComment.test(node.value)) {
					const comment = getComment.exec(node.value);

					if (comment) {
						const text = comment[1].trim();

						if (identifiers.includes(text)) {
							excerptIndex = treeChildren.indexOf(node);
						}
					}
				}
			});

			if (excerptIndex === -1) {
				const index = treeChildren.findIndex(
					child => child.type === 'paragraph'
				);
				if (index) treeChildren.splice(index + 1);
			} else {
				treeChildren.splice(excerptIndex);
			}

			const newTree = {
				type: tree.type,
				children: treeChildren
			};

			let excerpt = '';

			visit(newTree, 'paragraph', (node: Node) => {
				for (const child of node.children as Node[]) {
					if (child.type === 'text') {
						excerpt += child.value;
					}
				}
			});

			(file.data as any).excerpt = excerpt;
		}
	};
}
