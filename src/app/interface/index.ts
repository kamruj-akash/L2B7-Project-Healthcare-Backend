export interface IQuery {
	searchTerm?: string;
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: string;

	[key: string]: any | undefined;
}
