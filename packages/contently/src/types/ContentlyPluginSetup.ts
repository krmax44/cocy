export interface ContentlyPluginSetup {
	name: string;
	runner: (...options: any) => void;
}
