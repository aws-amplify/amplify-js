/**
 * General None HTTP-specific request interface
 */
export interface Request {
	url: URL;
	body?: unknown;
}

export interface Response {
	body: unknown;
}

export interface TransferHandler<
	Input extends Request,
	Output extends Response,
	TransferOptions
> {
	(request: Input, options: TransferOptions): Promise<Output>;
}

/**
 * A slimmed down version of the AWS SDK v3 middleware handler, only handling instantiated requests
 */
export type MiddlewareHandler<
	Input extends Request,
	Output extends Response,
	MiddlewareOptions
> = (request: Input, options: MiddlewareOptions) => Promise<Output>;

export type MiddlewareContext = Record<string, unknown>;

/**
 * A slimmed down version of the AWS SDK v3 middleware, only handling tasks after Serde.
 */
export type Middleware<
	Input extends Request,
	Output extends Response,
	MiddlewareOptions
> = (
	next: MiddlewareHandler<Input, Output, MiddlewareOptions>,
	context: MiddlewareContext
) => MiddlewareHandler<Input, Output, MiddlewareOptions>;
