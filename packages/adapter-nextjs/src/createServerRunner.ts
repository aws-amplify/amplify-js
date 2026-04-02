// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	type CreateServerRunnerInput,
	createServerRunner as createGenericServerRunner,
} from 'aws-amplify/adapter-core';

import { NextServer } from './types';
import { createAuthRouteHandlersFactory } from './auth';
import { createCookieStorageAdapterFromNextServerContext } from './utils/createCookieStorageAdapterFromNextServerContext';

export const createServerRunner = ({
	config,
	runtimeOptions,
}: CreateServerRunnerInput): NextServer.CreateServerRunnerOutput => {
	const { runWithAmplifyServerContext, resourcesConfig, globalSettings } =
		createGenericServerRunner({
			config,
			runtimeOptions,
			createCookieStorageAdapter: serverContext =>
				createCookieStorageAdapterFromNextServerContext(
					serverContext as NextServer.Context,
					globalSettings.isServerSideAuthEnabled(),
				),
		});

	return {
		runWithAmplifyServerContext,
		createAuthRouteHandlers: createAuthRouteHandlersFactory({
			config: resourcesConfig,
			amplifyAppOrigin: process.env.AMPLIFY_APP_ORIGIN,
			globalSettings,
			runWithAmplifyServerContext,
		}),
	};
};
