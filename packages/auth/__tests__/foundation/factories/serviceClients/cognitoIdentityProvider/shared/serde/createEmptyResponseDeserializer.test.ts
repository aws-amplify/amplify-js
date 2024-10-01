import {
	HttpResponse,
	parseJsonError,
} from '@aws-amplify/core/internals/aws-client-utils';

import { createEmptyResponseDeserializer } from '../../../../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/shared/serde/createEmptyResponseDeserializer';
import { AuthError } from '../../../../../../../src/errors/AuthError';

jest.mock('@aws-amplify/core/internals/aws-client-utils');

const mockParseJsonError = jest.mocked(parseJsonError);

describe('createEmptyResponseDeserializer created response deserializer', () => {
	const deserializer = createEmptyResponseDeserializer();

	it('returns undefined for 2xx status code', async () => {
		const response: HttpResponse = {
			statusCode: 200,
			body: {
				json: () => Promise.resolve({}),
				blob: () => Promise.resolve(new Blob()),
				text: () => Promise.resolve(''),
			},
			headers: {},
		};
		const output = await deserializer(response);

		expect(output).toBeUndefined();
	});

	it('throws AuthError for 4xx status code', async () => {
		const expectedErrorName = 'TestError';
		const expectedErrorMessage = 'TestErrorMessage';
		const expectedError = new Error(expectedErrorMessage);
		expectedError.name = expectedErrorName;

		mockParseJsonError.mockReturnValueOnce(expectedError as any);
		const response: HttpResponse = {
			statusCode: 400,
			body: {
				json: () => Promise.resolve({}),
				blob: () => Promise.resolve(new Blob()),
				text: () => Promise.resolve(''),
			},
			headers: {},
		};

		expect(deserializer(response as any)).rejects.toThrow(
			new AuthError({
				name: expectedErrorName,
				message: expectedErrorMessage,
			}),
		);
	});
});
