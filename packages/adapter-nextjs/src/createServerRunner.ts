// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createServerRunner as createGenericServerRunner } from 'aws-amplify/adapter-core';

import { NextServer } from './types';
import { createAuthRouteHandlersFactory } from './auth';
import { createCookieStorageAdapterFromNextServerContext } from './utils/createCookieStorageAdapterFromNextServerContext';

export const createServerRunner: NextServer.CreateServerRunner = ({
	config,
	runtimeOptions,
}) => {
	const { runWithAmplifyContext, resourcesConfig, globalSettings } =
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
		runWithAmplifyContext,
		createAuthRouteHandlers: createAuthRouteHandlersFactory({
			config: resourcesConfig,
			amplifyAppOrigin: process.env.AMPLIFY_APP_ORIGIN,
			globalSettings,
			runWithAmplifyServerContext,
		}),
	};
};
