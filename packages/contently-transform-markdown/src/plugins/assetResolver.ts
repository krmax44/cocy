import { join } from 'path';
import visit from 'unist-util-visit';
import { ContentlyPlugin } from 'contently';
import { Node } from 'unist'; // eslint-disable-line import/no-unresolved
import { VFile } from 'vfile';

interface AssetResolverOptions {
	plugin: ContentlyPlugin;
}

interface Image extends Node {
	type: 'image';
	url?: string;
	title?: string;
	alt?: string;
}

interface AssetVFile extends VFile {
	data: { [key: string]: any };
}

export function assetResolver({ plugin }: AssetResolverOptions): any {
	return async function(tree: Node, file: AssetVFile, next: () => void) {
		const allAssets = new Map();

		if (file.data.assets) {
			const { assets } = file.data;

			for (const asset of Object.keys(assets)) {
				const url = assets[asset];
				if (allAssets.has(url)) {
					file.data.$assets[asset] = allAssets.get(url);
				} else {
					const normalizedUrl = normalizeUrl(url, file);
					// eslint-disable-next-line no-await-in-loop
					file.data.$assets[asset] = await plugin.emit(
						'beforeAssetAdd',
						undefined,
						normalizedUrl
					);

					allAssets.set(url, file.data.$assets[asset]);
				}
			}
		}

		const queue: Array<Promise<void>> = [];

		visit(tree, 'image', (node: Image) => {
			if (allAssets.has(node.url)) {
				node.url = allAssets.get(node.url);
			} else {
				const promise = plugin
					.emit('beforeAssetAdd', undefined, normalizeUrl(node.url, file))
					.then(url => {
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
	if (url.startsWith('./') || url.startsWith('../')) {
		return join(file.dirname, url);
	}

	return url;
}
