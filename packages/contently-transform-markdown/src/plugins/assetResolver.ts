import path from 'path';
import visit from 'unist-util-visit';
import { Node } from 'unist';
import { VFile } from 'vfile';

interface AssetResolverOptions {
	assetHandler: (asset: string, file: string) => string | Promise<string>;
}

interface Image extends Node {
	type: 'image';
	url?: string;
	title?: string;
	alt?: string;
}

interface AssetVFile extends VFile {
	data: Record<string, any>;
}

export function assetResolver({ assetHandler }: AssetResolverOptions): any {
	return async function (tree: Node, file: AssetVFile, next: () => void) {
		const allAssets = new Map();

		if (file.data.assets) {
			const { assets } = file.data;

			for (const asset of Object.keys(assets)) {
				const url = assets[asset];

				if (allAssets.has(url)) {
					file.data.assets[asset] = allAssets.get(url);
				} else {
					const normalizedUrl = normalizeUrl(url, file);
					file.data.assets[asset] = await Promise.resolve(
						assetHandler(normalizedUrl, file.path!)
					);

					allAssets.set(url, file.data.assets[asset]);
				}
			}
		}

		const queue: Array<Promise<void>> = [];

		visit(tree, 'image', (node: Image) => {
			if (allAssets.has(node.url)) {
				node.url = allAssets.get(node.url);
			} else {
				const promise = Promise.resolve(
					assetHandler(normalizeUrl(node.url!, file), file.path!)
				).then(url => {
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

function normalizeUrl(url: string, file: VFile): string {
	return path.resolve(file.path!, url);
}
