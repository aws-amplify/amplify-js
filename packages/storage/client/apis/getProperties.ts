// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	GetPropertiesInput,
	GetPropertiesWithPathInput,
} from '../../src/providers/s3/types';
import { getProperties as getPropertiesFlow } from '../flows/getProperties';

export const getProperties = async (
	input: GetPropertiesInput | GetPropertiesWithPathInput,
) => {
	return getPropertiesFlow(input);
};
