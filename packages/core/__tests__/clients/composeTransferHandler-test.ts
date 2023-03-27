import { composeTransferHandler } from '../../src/clients/internal/composeTransferHandler';
import {
	Middleware,
	Request,
	Response,
	TransferHandler,
} from '../../src/clients/types';

describe(composeTransferHandler.name, () => {
	test('should call core handler', async () => {
		type HandlerOptions = { foo: string };
		const coreHandler: TransferHandler<Request, Response, HandlerOptions> = jest
			.fn()
			.mockResolvedValue({ body: 'Response' } as Response);
		const handler = composeTransferHandler<
			Request,
			Response,
			TransferHandler<Request, Response, HandlerOptions>
		>(coreHandler, []);
		const resp = await handler({ url: new URL('https://a.b') }, { foo: 'bar' });
		expect(resp).toEqual({ body: 'Response' });
		expect(coreHandler).toBeCalledWith(
			{ url: new URL('https://a.b') },
			{ foo: 'bar' }
		);
	});

	test('should call execute middleware in order', async () => {
		type OptionsType = { mockFnInOptions: (calledFrom: string) => void };
		const middlewareA: Middleware<Request, Response, OptionsType> =
			(next, context) => async (request, options) => {
				request.body += 'A';
				options.mockFnInOptions('A');
				const resp = await next(request, options);
				resp.body += 'A';
				return resp;
			};
		const middlewareB: Middleware<Request, Response, OptionsType> =
			(next, context) => async (request, options) => {
				request.body += 'B';
				options.mockFnInOptions('B');
				const resp = await next(request, options);
				resp.body += 'B';
				return resp;
			};
		const coreHandler: TransferHandler<Request, Response, {}> = jest
			.fn()
			.mockResolvedValue({ body: '' } as Response);
		const handler = composeTransferHandler<
			Request,
			Response,
			TransferHandler<Request, Response, {}>,
			[OptionsType, OptionsType]
		>(coreHandler, [middlewareA, middlewareB]);
		const options = {
			mockFnInOptions: jest.fn(),
		};
		const resp = await handler(
			{ url: new URL('https://a.b'), body: '' },
			options
		);
		expect(resp).toEqual({ body: 'BA' });
		expect(coreHandler).toBeCalledWith(
			expect.objectContaining({ body: 'AB' }),
			expect.anything()
		);
		// Validate middleware share a same option object
		expect(options.mockFnInOptions).toHaveBeenNthCalledWith(1, 'A');
		expect(options.mockFnInOptions).toHaveBeenNthCalledWith(2, 'B');
	});
});
