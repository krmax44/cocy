import { ContentlyFile } from './ContentlyFile';

/**
 * Absolute path to the resolved asset
 */
export type ContentlyResolvedAsset = string;

export type ContentlyAssetHandler = (
	assetPath: string,
	parentFile: ContentlyFile
) => ContentlyResolvedAsset | Promise<ContentlyResolvedAsset>;
