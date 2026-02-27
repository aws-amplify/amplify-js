/* eslint-disable no-console */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';

import { GetUrlInput, GetUrlOutput, GetUrlWithPathOutput } from '../../types';
import { getUrl as clientGetUrl } from '../../../../../client/apis/getUrl';
// TODO: Remove this interface when we move to public advanced APIs.
import { GetUrlInput as GetUrlWithPathInputWithAdvancedOptions } from '../../../../internals';

export const getUrl = async (
	amplify: AmplifyClassV6,
	input: GetUrlInput | GetUrlWithPathInputWithAdvancedOptions,
): Promise<GetUrlOutput | GetUrlWithPathOutput> => {
	console.log('🎯 Using NEW three-layer getUrl architecture via client API!');

	return clientGetUrl(input as any);
};
