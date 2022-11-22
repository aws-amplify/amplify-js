export type ICookieStorageData = {
	domain: string;
	path?: string;
	expires?: number;
	secure?: boolean;
	sameSite?: 'string' | 'lax' | 'none';
}