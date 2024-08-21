import { unauthenticatedHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { composeTransferHandler } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { cognitoUserPoolTransferHandler } from '../../../../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/shared/handler';

jest.mock('@aws-amplify/core/internals/aws-client-utils/composers');
jest.mock('@aws-amplify/core/internals/aws-client-utils');

const mockComposeTransferHandler = jest.mocked(composeTransferHandler);
const mockUnauthenticatedHandler = jest.mocked(unauthenticatedHandler);

describe('cognitoUserPoolTransferHandler', () => {
	beforeAll(() => {
		// need to make sure cognitoUserPoolTransferHandler is imported and used in
		// the scope of the test
		const _ = cognitoUserPoolTransferHandler;
	});

	it('adds the disableCacheMiddlewareFactory at module loading', () => {
		expect(mockComposeTransferHandler).toHaveBeenCalledTimes(1);

		const [core, middleware] = mockComposeTransferHandler.mock.calls[0];

		expect(core).toStrictEqual(mockUnauthenticatedHandler);
		expect(middleware).toHaveLength(1);

		const disableCacheMiddlewareFactory = middleware[0] as any;
		const disableCacheMiddlewarePendingNext = disableCacheMiddlewareFactory();

		const mockNext = jest.fn();
		const disableCacheMiddleware = disableCacheMiddlewarePendingNext(mockNext);
		const mockRequest = {
			headers: {},
		};

		disableCacheMiddleware(mockRequest);

		expect(mockNext).toHaveBeenCalledWith(mockRequest);
		expect(mockRequest.headers).toEqual({
			'cache-control': 'no-store',
		});
	});
});
