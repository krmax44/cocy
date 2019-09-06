export interface Sourcer {
	source: () => [{ [key: string]: string }];
}
