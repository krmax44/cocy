import visit from 'unist-util-visit';
import { Node } from 'unist';
import { VFile } from 'vfile';
import { ContentlyFile } from 'contently';

interface Image extends Node {
	type: 'image';
	url?: string;
	title?: string;
	alt?: string;
}

interface AssetVFile extends VFile {
	data: Record<string, any>;
}

type Options = { file: ContentlyFile };

export function assetResolver({ file: contentlyFile }: Options): any {
	return async function (tree: Node, file: AssetVFile, next: () => void) {
		const allAssets = new Map();

		const { assets } = file.data;
		if (assets) {
			for (const asset of Object.keys(assets)) {
				const url = assets[asset];

				if (allAssets.has(url)) {
					file.data.assets[asset] = allAssets.get(url);
				} else {
					file.data.assets[asset] = await contentlyFile.resolveAsset(
						url,
						asset
					);

					allAssets.set(url, file.data.assets[asset]);
				}
			}
		}

		const queue: Array<Promise<void>> = [];

		visit(tree, 'image', (node: Image) => {
			if (!node.url) return;

			if (allAssets.has(node.url)) {
				node.url = allAssets.get(node.url);
			} else {
				const promise = contentlyFile.resolveAsset(node.url).then(url => {
					if (!url) return;

					allAssets.set(node.url, url);
					node.url = url;
				});

				queue.push(promise);
			}
		});

		await Promise.all(queue);
		next();
	};
}
