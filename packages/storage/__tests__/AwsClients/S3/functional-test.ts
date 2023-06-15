import { HttpResponse } from '@aws-amplify/core/internals/aws-client-utils';
import { fetchTransferHandler } from '@aws-amplify/core/lib/clients/handlers/fetch';

import cases from './cases';

jest.mock('@aws-amplify/core/lib/clients/handlers/fetch');

const mockBinaryResponse = ({
	status,
	headers,
	body,
}: {
	status: number;
	headers: Record<string, string>;
	body: string;
}): HttpResponse => {
	const responseBody = {
		json: async (): Promise<any> => {
			throw new Error(
				'Parsing response to JSON is not implemented. Please use response.text() instead.'
			);
		},
		blob: async () => body as unknown as Blob,
		text: async () => body,
	} as HttpResponse['body'];
	return {
		statusCode: status,
		headers,
		body: responseBody,
	};
};

describe('S3 APIs functional test', () => {
	beforeEach(() => {
		(fetchTransferHandler as jest.Mock).mockReset();
	});
	test.each(cases)(
		'%s %s',
		async (
			caseType,
			name,
			handler,
			config,
			input,
			expectedRequest,
			response,
			outputOrError
		) => {
			expect.assertions(2);
			(fetchTransferHandler as jest.Mock).mockResolvedValue(
				mockBinaryResponse(response as any)
			);
			try {
				// @ts-ignore
				const output = await handler(config, input);
				if (caseType === 'happy case') {
					expect(output).toEqual(outputOrError);
					expect(fetchTransferHandler).toBeCalledWith(
						expectedRequest,
						expect.anything()
					);
				} else {
					fail(`${name} ${caseType} should fail`);
				}
			} catch (e) {
				if (caseType === 'happy case') {
					fail(`${name} ${caseType} should succeed: ${e}`);
				} else {
					expect(e).toBeInstanceOf(Error);
					expect(e).toEqual(expect.objectContaining(outputOrError));
				}
			}
		}
	);
});
