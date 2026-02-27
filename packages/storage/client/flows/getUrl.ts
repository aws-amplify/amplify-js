// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { GetUrlInput, GetUrlWithPathInput } from '../../src/providers/s3/types';
import { getUrlFlow, resolveGetUrlDependencies } from '../../foundation';

export const getUrl = async (input: GetUrlInput | GetUrlWithPathInput) => {
	const dependencies = await resolveGetUrlDependencies(Amplify, input);

	return getUrlFlow(input, dependencies);
};
