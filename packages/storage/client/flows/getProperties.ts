/* eslint-disable no-console */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import {
	GetPropertiesInput,
	GetPropertiesWithPathInput,
} from '../../src/providers/s3/types';
import {
	getPropertiesFlow,
	resolveGetPropertiesDependencies,
} from '../../foundation';

export const getProperties = async (
	input: GetPropertiesInput | GetPropertiesWithPathInput,
) => {
	console.log('🔍 Client getProperties - Input:', input);

	const dependencies = await resolveGetPropertiesDependencies(Amplify, input);
	console.log('🔍 Client getProperties - Dependencies resolved');

	return getPropertiesFlow(input, dependencies);
};
