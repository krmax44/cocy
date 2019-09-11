import { ContentlyPluginSetup } from './ContentlyPluginSetup';

export type PluginList = Array<{
	plugin: ContentlyPluginSetup;
	options?: any;
}>;
