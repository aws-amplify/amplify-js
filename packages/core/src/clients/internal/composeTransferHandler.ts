// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Middleware,
	MiddlewareHandler,
	TransferHandler,
	Request as RequestBase,
	Response as ResponseBase,
} from '../types';

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
		MiddlewareOptionsArr extends any[] = [],
		Request extends RequestBase = RequestBase,
		Response extends ResponseBase = ResponseBase,
		CoreHandler extends TransferHandler<
			Request,
			Response,
			any
		> = TransferHandler<Request, Response, {}>
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
		const context = {};
		let composedHandler: MiddlewareHandler<Request, Response> = (
			request: Request
		) => coreHandler(request, options);
		for (let i = middleware.length - 1; i >= 0; i--) {
			const m = middleware[i];
			const resolvedMiddleware = m(options);
			composedHandler = resolvedMiddleware(composedHandler, context);
		}
		return composedHandler(request);
	};

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
 * Type to intersect multiple types if they have no conflict keys.
 */
type MergeNoConflictKeys<Options extends any[]> = Options extends [
	infer OnlyOption
]
	? OnlyOption
	: Options extends [infer FirstOption, infer SecondOption]
	? FirstOption & SecondOption
	: Options extends [infer FirstOption, ...infer RestOptions]
	? FirstOption & MergeNoConflictKeys<RestOptions>
	: never;

/**
 * Type to infer the option type of a transfer handler type.
 */
type InferOptionTypeFromTransferHandler<
	T extends TransferHandler<any, any, any>
> = Parameters<T>[1];
