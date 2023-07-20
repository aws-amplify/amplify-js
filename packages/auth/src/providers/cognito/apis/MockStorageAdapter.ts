import { AuthTokens } from './tokensProvider';

export class StorageAdapter {
	content!: AuthTokens;

	get() {
		return this.content;
	}

	set(data: AuthTokens) {
		this.content = data;
	}
}
