import { ServiceClientOptions } from '../types/aws';
import {
	Middleware,
	MiddlewareHandler,
	TransferHandler,
	Request as RequestBase,
	Response as ResponseBase,
	Endpoint,
} from '../types/core';
import { HttpRequest, HttpResponse } from '../types/http';
import { retry, RetryOptions } from '../middleware/retry';

export const composeServiceApi = <
	Input,
	Output,
	TransferHandlerOptions,
	DefaultConfig extends Partial<TransferHandlerOptions & ServiceClientOptions>
>(
	transferHandler: TransferHandler<
		HttpRequest,
		HttpResponse,
		TransferHandlerOptions
	>,
	serializer: (input: Input, endpoint: Endpoint) => Promise<HttpRequest>,
	deserializer: (output: HttpResponse) => Promise<Output>,
	defaultConfig: DefaultConfig
) => {
	return async (
		config: OptionalizeKey<
			TransferHandlerOptions & ServiceClientOptions,
			keyof DefaultConfig
		>,
		input: Input
	) => {
		const resolvedConfig = {
			...defaultConfig,
			...config,
		} as unknown as TransferHandlerOptions & ServiceClientOptions;
		const retryMiddleware = retry(resolvedConfig);

		const endpoint = await resolvedConfig.endpointResolver({
			region: resolvedConfig.region,
		});
		let request = await serializer(input, endpoint);
		if (config.modifyAfterSerialization) {
			request = await config.modifyAfterSerialization(request);
		}
		let response = await transferHandler(request, resolvedConfig);
		if (config.modifyBeforeDeserialization) {
			response = await config.modifyBeforeDeserialization(response);
		}
		return await deserializer(response);
	};
};

type OptionalizeKey<T, K> = Omit<T, K & keyof T> & {
	[P in K & keyof T]?: T[P];
};
