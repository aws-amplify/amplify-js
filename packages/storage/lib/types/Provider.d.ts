export interface StorageProvider {
	configure(config: object): object;
	get(key: string, options?: any): Promise<String | Object>;
	put(key: string, object: any, options?: any): Promise<Object>;
	remove(key: string, options?: any): Promise<any>;
	list(path: any, options?: any): Promise<any>;
	getCategory(): string;
	getProviderName(): string;
}
