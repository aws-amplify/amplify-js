import { composeServiceApi } from '../../src/clients/internal/composeApiHandler';

describe(composeServiceApi.name, () => {
	const defaultRequest = {
		url: new URL('https://a.b'),
		method: 'GET',
		headers: {},
	};
	const defaultResponse = { body: 'Response', statusCode: 200, headers: {} };
	const defaultConfig = {
		endpointResolver: jest.fn().mockReturnValue('https://a.b'),
	};
	test('should call transfer handler with resolved config', async () => {
		const mockTransferHandler = jest.fn().mockResolvedValue(defaultResponse);
		const config = {
			...defaultConfig,
			foo: 'bar',
		};
		const api = composeServiceApi(
			mockTransferHandler,
			input => defaultRequest,
			async output => ({
				Result: 'from API',
			}),
			defaultConfig
		);
		const output = await api({ bar: 'baz', foo: 'foo' }, 'Input');
		expect(mockTransferHandler).toBeCalledTimes(1);
		expect(mockTransferHandler).toBeCalledWith(
			defaultRequest,
			expect.objectContaining({
				bar: 'baz',
				foo: 'foo',
			})
		);
	});

	test('should call serializer and deserializer', async () => {
		const mockTransferHandler = jest.fn().mockResolvedValue(defaultResponse);
		const defaultConfig = {
			foo: 'bar',
			endpointResolver: jest.fn().mockReturnValue('https://a.b'),
		};
		const mockSerializer = jest.fn().mockReturnValue({ body: 'Serialized' });
		const mockDeserializer = jest.fn().mockReturnValue({
			Result: 'from server',
		});
		const api = composeServiceApi(
			mockTransferHandler,
			mockSerializer,
			mockDeserializer,
			defaultConfig
		);
		const output = await api({ bar: 'baz', foo: 'foo' }, 'Input');
		expect(mockSerializer).toBeCalledTimes(1);
		expect(mockSerializer).toBeCalledWith(
			'Input',
			defaultConfig.endpointResolver.mock.results[0].value
		);
		expect(mockDeserializer).toBeCalledTimes(1);
		expect(mockDeserializer).toBeCalledWith(defaultResponse);
	});
});
