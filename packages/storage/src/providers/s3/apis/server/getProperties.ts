// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import {
	GetPropertiesInput,
	GetPropertiesInputKey,
	GetPropertiesInputPath,
	GetPropertiesOutput,
	GetPropertiesOutputKey,
	GetPropertiesOutputPath,
} from '../../types';
import { getProperties as getPropertiesInternal } from '../internal/getProperties';

interface GetProperties {
	(
		contextSpec: AmplifyServer.ContextSpec,
		input: GetPropertiesInputPath,
	): Promise<GetPropertiesOutputPath>;
	(
		contextSpec: AmplifyServer.ContextSpec,
		input: GetPropertiesInputKey,
	): Promise<GetPropertiesOutputKey>;
}

export const getProperties: GetProperties = <
	Output extends GetPropertiesOutput,
>(
	contextSpec: AmplifyServer.ContextSpec,
	input: GetPropertiesInput,
): Promise<Output> => {
	return getPropertiesInternal(
		getAmplifyServerContext(contextSpec).amplify,
		input,
	) as Promise<Output>;
};
