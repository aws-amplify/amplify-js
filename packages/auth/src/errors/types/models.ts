export type AuthErrorParams = {
	message: string;
	underlyingError?: Error | unknown;
	recoverySuggestion?: string;
	name: string;
};

export type AuthErrorMap<ErrorCode extends string> = {
	[name in ErrorCode]: {
		message: string;
		recoverySuggestion?: string;
	};
};

export type ServiceError = {
	name: string;
	message: string;
};
