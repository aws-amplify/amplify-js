// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig } from 'aws-amplify';
import { createServerRunner as createGenericServerRunner } from 'aws-amplify/adapter-core';
import { parseAmplifyConfig } from 'aws-amplify/utils';

import { NextServer } from '../types';
import { createCookieStorageAdapterFromNextServerContext } from '../utils/createCookieStorageAdapterFromNextServerContext';

export const createServerRunnerForAPI = ({
	config,
}: NextServer.CreateServerRunnerInput): {
	runWithAmplifyServerContext: NextServer.RunOperationWithContext;
	resourcesConfig: ResourcesConfig;
} => {
	const amplifyConfig = parseAmplifyConfig(config);

	const { runWithAmplifyServerContext: runGeneric, globalSettings } =
		createGenericServerRunner({
			config: amplifyConfig,
			createCookieStorageAdapter: serverContext =>
				createCookieStorageAdapterFromNextServerContext(
					serverContext as NextServer.Context,
					globalSettings.isServerSideAuthEnabled(),
				),
		});

	const runWithAmplifyServerContext: NextServer.RunOperationWithContext =
		async ({ serverContext, operation }) =>
			runGeneric({ serverContext, operation });

	return {
		runWithAmplifyServerContext,
		resourcesConfig: amplifyConfig,
	};
};
