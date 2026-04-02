// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Request, Response } from 'express';
import { CookieStorage } from 'aws-amplify/adapter-core/internals';
import { AmplifyContext, ResourcesConfig } from 'aws-amplify';
import { GlobalSettings as CoreGlobalSettings } from 'aws-amplify/adapter-core';

export declare namespace ExpressServer {
	/**
	 * The Express.js server context containing the request and response objects.
	 * Requires the `cookie-parser` middleware to be installed in the Express app.
	 */
	export interface Context {
		request: Request;
		response: Response;
	}

	export interface RunWithContextInput<OperationResult> {
		expressServerContext: Context | null;
		operation(
			amplifyContext: AmplifyContext,
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
		config: ResourcesConfig | Record<string, unknown>;
		runtimeOptions?: CreateServerRunnerRuntimeOptions;
	}

	export interface CreateServerRunnerOutput {
		runWithAmplifyServerContext: RunOperationWithContext;
	}

	export type CreateServerRunner = (
		input: CreateServerRunnerInput,
	) => CreateServerRunnerOutput;

	export interface GlobalSettings extends CoreGlobalSettings {
		getRuntimeOptions(): CreateServerRunnerRuntimeOptions;
	}
}
