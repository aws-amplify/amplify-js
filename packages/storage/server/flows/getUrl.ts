/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-relative-packages */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import { GetUrlInput, GetUrlWithPathInput } from '../../src/providers/s3/types';
import { getUrlFlow, resolveGetUrlDependencies } from '../../foundation';

export const getUrl = async (
	contextSpec: AmplifyServer.ContextSpec,
	input: GetUrlInput | GetUrlWithPathInput,
) => {
	const amplifyServerContext = getAmplifyServerContext(contextSpec);
	const dependencies = await resolveGetUrlDependencies(
		amplifyServerContext.amplify,
		input,
	);

	return getUrlFlow(input, dependencies);
};
