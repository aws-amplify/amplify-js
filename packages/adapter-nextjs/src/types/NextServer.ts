// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { GetServerSidePropsContext as NextGetServerSidePropsContext } from 'next';
import { NextRequest, NextResponse } from 'next/server.js';
import { cookies } from 'next/headers.js';
import {
	AmplifyOutputsUnknown,
	AmplifyServer,
	CookieStorage,
	LegacyConfig,
} from 'aws-amplify/adapter-core/internals';
import { ResourcesConfig } from 'aws-amplify';

import { CreateAuthRouteHandlers } from '../auth/types';

export declare namespace NextServer {
	/**
	 * This context is normally available in the following:
	 *   - Next App Router [middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
	 *   - Next App Router [route handler](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
	 *     when using `NextResponse` to create the response of the route handler
	 */
	export interface NextRequestAndNextResponseContext {
		request: NextRequest;
		response: NextResponse;
	}

	/**
	 * This context is normally available in the following:
	 *   - Next App Router [route handler](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
	 *     when using the Web API [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response)
	 *     to create the response of the route handler
	 */
	export interface NextRequestAndResponseContext {
		request: NextRequest;
		response: Response;
	}

	/**
	 * This context is normally available in the following:
	 *   - Next [Server Component](https://nextjs.org/docs/getting-started/react-essentials#server-components)
	 *     where the [`cookies`](https://nextjs.org/docs/app/api-reference/functions/cookies)
	 *     function can be imported and called
	 */
	export interface ServerComponentContext {
		cookies: typeof cookies;
	}

	export type ServerActionContext = ServerComponentContext;

	/**
	 * This context is normally available in the
	 * [`getServerSideProps`](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props)
	 * function of the Next Pages Router.
	 */
	export interface GetServerSidePropsContext {
		request: NextGetServerSidePropsContext['req'];
		response: NextGetServerSidePropsContext['res'];
	}

	/**
	 * The union of possible Next.js app server context types.
	 */
	export type Context =
		| NextRequestAndNextResponseContext
		| NextRequestAndResponseContext
		| ServerComponentContext
		| GetServerSidePropsContext;

	export interface RunWithContextInput<OperationResult> {
		nextServerContext: Context | null;
		operation(
			contextSpec: AmplifyServer.ContextSpec,
		): OperationResult | Promise<OperationResult>;
	}

	export type RunOperationWithContext = <OperationResult>(
		input: RunWithContextInput<OperationResult>,
	) => Promise<OperationResult>;

	export interface CreateServerRunnerRuntimeOptions {
		cookies?: Pick<
			CookieStorage.SetCookieOptions,
			'domain' | 'expires' | 'sameSite' | 'maxAge'
		>;
	}

	export interface CreateServerRunnerInput {
		config: ResourcesConfig | LegacyConfig | AmplifyOutputsUnknown;
		runtimeOptions?: CreateServerRunnerRuntimeOptions;
	}

	export interface CreateServerRunnerOutput {
		/**
		 * The function to run an operation with the Amplify server context. The operation is a callback function that
		 * takes a context spec parameter which is used to call the Amplify-side server APIs. The result of the operation
		 * is returned as a promise.
		 *
		 * @example
		 * ```
		 * // In `src/amplifyUtils.ts`
		 * import { createServerRunner } from 'aws-amplify/adapter-nextjs';
		 * import outputs from '@/amplify_outputs.json';
		 *
		 * export const { runWithAmplifyServerContext } = createServerRunner({ config: outputs });
		 *
		 * // In `src/app/home/page.tsx` (App router)
		 * import { cookies } from 'next/headers';
		 * import { runWithAmplifyServerContext } from '@/amplifyUtils';
		 *
		 * export default async function HomePage() {
		 *   const user = await runWithAmplifyServerContext({
		 *     nextServerContext: { cookies },
		 *     operation: (contextSpec) => getCurrentUser(contextSpec),
		 *   });
		 *
		 *  return <div>{`Hello, ${user.username}`}</div>;
		 * }
		 *
		 * // In `src/pages/home/index.tsx` (Pages router)
		 * import { runWithAmplifyServerContext } from '@/amplifyUtils';
		 *
		 * export const getServerSideProps = async ({ req, res }) => {
		 *   const user = await runWithAmplifyServerContext({
		 *     nextServerContext: { request: req, response: res },
		 *     operation: (contextSpec) => getCurrentUser(contextSpec),
		 *   });
		 *
		 *   return {
		 *     props: { user },
		 *   }
		 * }
		 *
		 * export default function HomePage(props) {
		 *   return <div>{`Hello, ${props.user.username}`}</div>;
		 * }
		 * ```
		 */
		runWithAmplifyServerContext: RunOperationWithContext;
		/**
		 * The factory function to create the route handlers for the Amplify server-side authentication. You can call this
		 * function and export the result as the route handlers in the Next.js API routes, to authenticate your end users
		 * on the server side.
		 *
		 * Note: when enabling server-side authentication, Amplify APIs can no longer be used in the client-side.
		 * @experimental
		 *
		 * @example
		 * ```
		 * // In `src/amplifyUtils.ts`
		 * import { createServerRunner } from 'aws-amplify/adapter-nextjs';
		 * import outputs from '@/amplify_outputs.json';
		 *
		 * export const { createAuthRouteHandlers } = createServerRunner({ config: outputs });
		 *
		 * // In `src/app/api/auth/[slug]/route.tsx` (App router)
		 * import { createAuthRouteHandlers } from '@/amplifyUtils';
		 *
		 * export const GET = createAuthRouteHandlers({
		 *   redirectOnSignInComplete: "/home",
		 *   redirectOnSignOutComplete: "/sign-in",
		 * );
		 *
		 * // In `src/pages/api/auth/[slug].tsx` (Pages router)
		 * import { createAuthRouteHandlers } from '@/amplifyUtils';
		 *
		 * export default createAuthRouteHandlers({
		 *   redirectOnSignInComplete: "/home",
		 *   redirectOnSignOutComplete: "/sign-in",
		 * });
		 * ```
		 */
		createAuthRouteHandlers: CreateAuthRouteHandlers;
	}

	export type CreateServerRunner = (
		input: CreateServerRunnerInput,
	) => CreateServerRunnerOutput;

	export interface GlobalSettings {
		isServerSideAuthEnabled(): boolean;
		enableServerSideAuth(): void;
		setRuntimeOptions(runtimeOptions: CreateServerRunnerRuntimeOptions): void;
		getRuntimeOptions(): CreateServerRunnerRuntimeOptions;
		setIsSSLOrigin(isSSLOrigin: boolean): void;
		isSSLOrigin(): boolean;
	}
}
