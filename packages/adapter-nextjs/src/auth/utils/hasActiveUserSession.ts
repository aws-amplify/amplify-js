// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NextRequest } from 'next/server';
import { getCurrentUser } from 'aws-amplify/auth';
import { NextApiRequest, NextApiResponse } from 'next';

import { NextServer } from '../../types';

export const hasActiveUserSessionWithAppRouter = async ({
	request,
	runWithAmplifyServerContext,
}: {
	request: NextRequest;
	runWithAmplifyServerContext: NextServer.RunOperationWithContext;
}): Promise<boolean> => {
	const dummyResponse = new Response();

	try {
		await runWithAmplifyServerContext({
			nextServerContext: { request, response: dummyResponse },
			operation(ctx) {
				return getCurrentUser(ctx);
			},
		});

		return true;
	} catch (_) {
		// `getCurrentUser()` throws if there is no valid token
		return false;
	}
};

export const hasActiveUserSessionWithPagesRouter = async ({
	request,
	response,
	runWithAmplifyServerContext,
}: {
	request: NextApiRequest;
	response: NextApiResponse;
	runWithAmplifyServerContext: NextServer.RunOperationWithContext;
}): Promise<boolean> => {
	try {
		await runWithAmplifyServerContext({
			nextServerContext: { request, response },
			operation(ctx) {
				return getCurrentUser(ctx);
			},
		});

		return true;
	} catch (_) {
		// `getCurrentUser()` throws if there is no valid token
		return false;
	}
};
