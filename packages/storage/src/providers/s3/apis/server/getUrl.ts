// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
import { GetUrlInput, GetUrlOutput } from '../../types';
import { getUrl as getUrlInternal } from '../internal/getUrl';

export const getUrl = async (
	contextSpec: AmplifyServer.ContextSpec,
	input: GetUrlInput
): Promise<GetUrlOutput> => {
	return getUrlInternal(getAmplifyServerContext(contextSpec).amplify, input);
};
