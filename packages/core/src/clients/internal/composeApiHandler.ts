import { ServiceClientOptions } from '../types/aws';
import { TransferHandler, Endpoint } from '../types/core';
import { HttpRequest, HttpResponse } from '../types/http';

export const composeServiceApi = <
	TransferHandlerOptions,
	Input,
	Output,
	DefaultConfig extends Partial<TransferHandlerOptions & ServiceClientOptions>
>(
	transferHandler: TransferHandler<
		HttpRequest,
		HttpResponse,
		TransferHandlerOptions
	>,
	serializer: (input: Input, endpoint: Endpoint) => HttpRequest,
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
		const endpoint = await resolvedConfig.endpointResolver({
			region: resolvedConfig.region,
		});
		const request = serializer(input, endpoint);
		const response = await transferHandler(request, {
			...resolvedConfig,
		});
		return await deserializer(response);
	};
};

type OptionalizeKey<T, K> = Omit<T, K & keyof T> & {
	[P in K & keyof T]?: T[P];
};
