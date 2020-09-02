// TODO: decide whether this custom error is necessary
export class CognitoError extends Error {
	constructor(
		message: string,
		public code: number,
		public name: string,
		public statusCode: number
	) {
		super(message);
	}
}

export function handleError<Response>(
	response: Response
): response is Response {
	// @ts-ignore
	const { message, __type: type } = response;
	if (type) {
		throw new CognitoError(message, 400, type, 400);
	}
	return true;
}
