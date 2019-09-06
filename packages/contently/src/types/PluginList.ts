import { ContentlyPlugin } from './ContentlyPlugin';

export type PluginList = Array<{
	plugin: ContentlyPlugin;
	options?: any;
}>;
