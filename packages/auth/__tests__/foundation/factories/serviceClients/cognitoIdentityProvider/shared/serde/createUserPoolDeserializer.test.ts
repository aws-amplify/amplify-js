import {
	HttpResponse,
	parseJsonBody,
	parseJsonError,
} from '@aws-amplify/core/internals/aws-client-utils';

import { createUserPoolDeserializer } from '../../../../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/shared/serde/createUserPoolDeserializer';
import { AuthError } from '../../../../../../../src/errors/AuthError';

jest.mock('@aws-amplify/core/internals/aws-client-utils');

const mockParseJsonBody = jest.mocked(parseJsonBody);
const mockParseJsonError = jest.mocked(parseJsonError);

describe('buildUserPoolDeserializer created response deserializer', () => {
	const deserializer = createUserPoolDeserializer();

	it('returns body for 2xx status code', async () => {
		const expectedBody = { test: 'test' };
		mockParseJsonBody.mockResolvedValueOnce(expectedBody);
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

		expect(output).toStrictEqual(expectedBody);
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
