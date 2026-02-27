/* eslint-disable no-console */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import {
	GetPropertiesInput,
	GetPropertiesOutput,
	GetPropertiesWithPathOutput,
} from '../../types';
import { getProperties as clientGetProperties } from '../../../../../client/apis/getProperties';
// TODO: Remove this interface when we move to public advanced APIs.
import { GetPropertiesInput as GetPropertiesWithPathInputWithAdvancedOptions } from '../../../../internals';

export const getProperties = async (
	amplify: AmplifyClassV6,
	input: GetPropertiesInput | GetPropertiesWithPathInputWithAdvancedOptions,
	action?: StorageAction,
): Promise<GetPropertiesOutput | GetPropertiesWithPathOutput> => {
	console.log(
		'🎯 Using NEW three-layer getProperties architecture via client API!',
	);

	return clientGetProperties(input);
};
