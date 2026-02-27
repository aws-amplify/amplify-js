// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import { GetPropertiesInput } from '../../src/providers/s3/types';
import {
	getPropertiesFlow,
	resolveGetPropertiesDependencies,
} from '../../foundation';

export const getProperties = async (
	input: GetPropertiesInput | any,
	action?: StorageAction,
) => {
	const dependencies = await resolveGetPropertiesDependencies(
		Amplify,
		input,
		action,
	);

	return getPropertiesFlow(input, dependencies, action);
};
