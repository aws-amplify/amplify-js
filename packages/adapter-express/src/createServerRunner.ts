// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	type CreateServerRunnerInput,
	createServerRunner as createGenericServerRunner,
} from 'aws-amplify/adapter-core';

import { ExpressServer } from './types';
import { createCookieStorageAdapterFromExpressContext } from './utils/createCookieStorageAdapterFromExpressContext';

export const createServerRunner = ({
	config,
	runtimeOptions,
}: CreateServerRunnerInput) => {
	const { runWithAmplifyServerContext } = createGenericServerRunner({
		config,
		runtimeOptions,
		createCookieStorageAdapter: serverContext =>
			createCookieStorageAdapterFromExpressContext(
				serverContext as ExpressServer.Context,
			),
	});

	return {
		runWithAmplifyServerContext: async <Result>({
			expressServerContext,
			operation,
		}: ExpressServer.RunWithContextInput<Result>): Promise<Result> =>
			runWithAmplifyServerContext({
				serverContext: expressServerContext,
				operation,
			}),
	};
};
