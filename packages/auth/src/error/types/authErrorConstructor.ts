export type AuthErrorConstructor = {
	message: string;
	underlyingException?: Error | unknown;
	recoverySuggestion?: string;
	name: string;
};
