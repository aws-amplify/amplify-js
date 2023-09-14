// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NextServer } from './types';
import {
	createCookieStorageAdapterFromNextServerContext,
	getAmplifyConfig,
} from './utils';
import { sharedInMemoryStorage } from '@aws-amplify/core';
import {
	createAWSCredentialsAndIdentityIdProvider,
	createKeyValueStorageFromCookieStorageAdapter,
	createUserPoolsTokenProvider,
	runWithAmplifyServerContext as runWithAmplifyServerContextCore,
} from 'aws-amplify/internals/adapter-core';

/**
 * Runs the {@link operation} with the the context created from the {@link nextServerContext}.
 *
 * @param input The input to call the {@link runWithAmplifyServerContext}.
 * @param input.nextServerContext The Next.js server context. It varies depends
 *   where the {@link runWithAmplifyServerContext} is being called.
 *   - In the [middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware):
 *     the context consists of an instance of the `NextRequest` and an instance
 *     of the `NextResponse`.
 *   - In a [Page server component](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages):
 * 	   the context is the [`cookies`](https://nextjs.org/docs/app/api-reference/functions/cookies)
 *     function provided by Next.js.
 *   - In a [Route Handler](https://nextjs.org/docs/app/building-your-application/routing/route-handlers):
 *     the context can be the [`cookies`](https://nextjs.org/docs/app/api-reference/functions/cookies)
 *     function or a combination of an instance of the `NextRequest` and an instance
 *     of the `NextResponse`.
 *   - In a [Server Action](https://nextjs.org/docs/app/building-your-application/data-fetching/forms-and-mutations#how-server-actions-work):
 *     the context is the [`cookies`](https://nextjs.org/docs/app/api-reference/functions/cookies)
 *     function provided by Next.js.
 * @param input.operation The function that contains the business logic calling
 *   Amplify APIs. It expects a `contextSpec` parameter.
 * @returns The result returned by the {@link operation}.
 * @example
 * // Use the `fetchAuthSession` API in the Next.js `middleware`.
 * import { NextRequest, NextResponse } from "next/server";
 * import { fetchAuthSession } from "aws-amplify/auth/server";
 * import { runWithAmplifyServerContext } from "@aws-amplify/adapter-nextjs";

 * export async function middleware(request: NextRequest) {
 *   const response = NextResponse.next();
 *   const authenticated = await runWithAmplifyServerContext({
 *     nextServerContext: { request, response },
 *     operation: async (contextSpec) => {
 *       const session = await fetchAuthSession(contextSpec);
 *       return session.tokens !== undefined;
 *     }
 *   });
 *   if (authenticated) {
 *     return response;
 *   }
 *   return NextResponse.redirect(new URL('/sign-in', request.url));
 * }
 */
export const runWithAmplifyServerContext: NextServer.RunOperationWithContext =
	async ({ nextServerContext, operation }) => {
		// 1. get amplify config from env vars
		// 2. create key-value storage from nextServerContext
		// 3. create credentials provider
		// 4. create token provider
		// 5. call low level runWithAmplifyServerContext
		const amplifyConfig = getAmplifyConfig();

		// When the Auth config is presented, attempt to create a Amplify server
		// context with token and credentials provider.
		if (amplifyConfig.Auth) {
			const keyValueStorage =
				// When `null` is passed as the value of `nextServerContext`, opt-in
				// unauthenticated role (primarily for static rendering). It's
				// safe to use the singleton `MemoryKeyValueStorage` here, as the
				// static rendering uses the same unauthenticated role cross-sever.
				nextServerContext === null
					? sharedInMemoryStorage
					: createKeyValueStorageFromCookieStorageAdapter(
							createCookieStorageAdapterFromNextServerContext(nextServerContext)
					  );
			const credentialsProvider = createAWSCredentialsAndIdentityIdProvider(
				amplifyConfig.Auth,
				keyValueStorage
			);
			const tokenProvider = createUserPoolsTokenProvider(
				amplifyConfig.Auth,
				keyValueStorage
			);

			return runWithAmplifyServerContextCore(
				amplifyConfig,
				{
					Auth: { credentialsProvider, tokenProvider },
				},
				operation
			);
		}

		// Otherwise it may be the case that auth is not used, e.g. API key.
		// Omitting the `Auth` in the second parameter.
		return runWithAmplifyServerContextCore(amplifyConfig, {}, operation);
	};
