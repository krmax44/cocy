interface ResultData {
	id: string;
	slug: string;
	data: string;
	attributes: {
		createdAt: Date;
		modifiedAt: Date;
		title: string;
		[key: string]: any;
	};
	assets?: { [key: string]: string };
}

export class ContentlyResult {
	public id: string;

	public slug: string;

	public data: string;

	public attributes: {
		createdAt: Date;
		modifiedAt: Date;
		title: string;
		[key: string]: any;
	};

	public assets: { [key: string]: string };

	constructor(input: ResultData) {
		this.id = input.id;
		this.slug = input.slug;
		this.data = input.data;
		this.attributes = input.attributes;
		this.assets = input.assets || {};
	}
}
