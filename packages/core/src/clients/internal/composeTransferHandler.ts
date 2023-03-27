import {
	Middleware,
	MiddlewareHandler,
	TransferHandler,
	Request as RequestBase,
	Response as ResponseBase,
} from '../types';

/**
 * Type to convert a middleware option type to a middleware type with the given
 * option type.
 */
type OptionToMiddleware<
	Request extends RequestBase,
	Response extends ResponseBase,
	Options extends any[]
> = Options extends []
	? []
	: Options extends [infer LastOption]
	? [Middleware<Request, Response, LastOption>]
	: Options extends [infer FirstOption, ...infer RestOptions]
	? [
			Middleware<Request, Response, FirstOption>,
			...OptionToMiddleware<Request, Response, RestOptions>
	  ]
	: never;

/**
 * Type to merge two types to validate if 2 types have no conflict keys.
 */
type EnsureNoConflictKeys<T, U> = Pick<U, keyof T & keyof U> extends Pick<
	T,
	keyof T & keyof U
>
	? true
	: false;

/**
 * Type to intersect two types if they have no conflict keys.
 */
type MergeTwoNoConflictKeys<T, U> = EnsureNoConflictKeys<T, U> extends true
	? T & U
	: never;

/**
 * Type to intersect multiple types if they have no conflict keys.
 */
type MergeNoConflictKeys<Options extends any[]> = Options extends [
	infer OnlyOption
]
	? OnlyOption
	: Options extends [infer FirstOption, infer SecondOption]
	? MergeTwoNoConflictKeys<FirstOption, SecondOption>
	: Options extends [infer FirstOption, ...infer RestOptions]
	? MergeTwoNoConflictKeys<FirstOption, MergeNoConflictKeys<RestOptions>>
	: never;

/**
 * Type to infer the option type of a transfer handler type.
 */
type InferOptionTypeFromTransferHandler<
	T extends TransferHandler<any, any, any>
> = Parameters<T>[1];

/**
 * Compose a transfer handler with a core transfer handler and a list of middleware.
 * @param coreHandler Core transfer handler
 * @param middleware	List of middleware
 * @returns A transfer handler whose option type is the union of the core
 * 	transfer handler's option type and the middleware's option type.
 * @internal
 */
export const composeTransferHandler =
	<
		Request extends RequestBase,
		Response extends ResponseBase,
		CoreHandler extends TransferHandler<Request, Response, any>,
		MiddlewareOptionsArr extends any[] = []
	>(
		coreHandler: CoreHandler,
		middleware: OptionToMiddleware<Request, Response, MiddlewareOptionsArr>
	) =>
	(
		request: Request,
		options: MergeNoConflictKeys<
			[...MiddlewareOptionsArr, InferOptionTypeFromTransferHandler<CoreHandler>]
		>
	) => {
		let composedHandler = coreHandler as unknown as MiddlewareHandler<
			Request,
			Response,
			MiddlewareOptionsArr[number]
		>;
		for (const m of middleware.reverse()) {
			composedHandler = m(composedHandler, {});
		}
		return composedHandler(request, options);
	};
