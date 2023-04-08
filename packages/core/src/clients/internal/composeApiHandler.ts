import { ServiceClientOptions } from '../types/aws';
import { TransferHandler, Endpoint, MiddlewareContext } from '../types/core';
import { HttpRequest, HttpResponse } from '../types/http';
import { retry } from '../middleware/retry';

const DEFAULT_RETRY_ATTEMPTS = 3;

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
		const apiRetryMiddlewareContext: MiddlewareContext = {};
		let { maxAttempts: restAttempts = DEFAULT_RETRY_ATTEMPTS } = resolvedConfig;
		const serdeHandler = async (request: HttpRequest) => {
			restAttempts -= apiRetryMiddlewareContext.attemptsCount ?? 0;
			const response = await transferHandler(request, {
				...resolvedConfig,
				maxAttempts: restAttempts,
			});
			return await deserializer(response);
		};

		const configuredRetryMiddleware = retry<HttpRequest, Output>({
			...resolvedConfig,
			// todo: update this when AWS service retry policy is ready.
			retryDecider: (response, error) => {
				if (error) return true;
				return false;
			},
		});

		const retryableSerdeHandler = configuredRetryMiddleware(async request => {
			return await serdeHandler(request);
		}, apiRetryMiddlewareContext);

		const endpoint = await resolvedConfig.endpointResolver({
			region: resolvedConfig.region,
		});
		const request = await serializer(input, endpoint);
		return await retryableSerdeHandler(request);
	};
};

type OptionalizeKey<T, K> = Omit<T, K & keyof T> & {
	[P in K & keyof T]?: T[P];
};
