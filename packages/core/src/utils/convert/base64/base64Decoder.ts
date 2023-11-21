// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getAtob } from '~/src/utils/globalHelpers';
import { Base64Decoder } from '~/src/utils/convert/types';

export const base64Decoder: Base64Decoder = {
	convert(input) {
		return getAtob()(input);
	},
};
