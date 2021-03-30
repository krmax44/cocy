import visit from 'unist-util-visit';
import { Node } from 'unist';
import { VFile } from 'vfile';
import { CocyFile } from 'cocy';

interface Image extends Node {
	type: 'image';
	url?: string;
	title?: string;
	alt?: string;
}

interface AssetVFile extends VFile {
	data: Record<string, any>;
}

type Options = { file: CocyFile };

export function assetResolver({ file: cocyFile }: Options): any {
	return async function (tree: Node, file: AssetVFile, next: () => void) {
		const allAssets = new Map();

		const { assets } = file.data;
		if (assets) {
			for (const asset of Object.keys(assets)) {
				const url = assets[asset];

				if (allAssets.has(url)) {
					file.data.assets[asset] = allAssets.get(url);
				} else {
					file.data.assets[asset] = await cocyFile.resolveAsset(url, asset);

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
				const promise = cocyFile.resolveAsset(node.url).then(url => {
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
