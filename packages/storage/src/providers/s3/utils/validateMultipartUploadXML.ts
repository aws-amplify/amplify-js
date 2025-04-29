// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { IntegrityError } from '../../../errors/IntegrityError';

import { parser } from './client/runtime';
import { CompletedMultipartUpload } from './client/s3data/types';
import {
	deserializeCompletedPartList,
	emptyArrayGuard,
	map,
} from './client/utils';
import { isEqual } from './client/utils/integrityHelpers';

export function validateMultipartUploadXML(
	input: CompletedMultipartUpload,
	xml: string,
) {
	if (!input.Parts) {
		throw new IntegrityError();
	}
	const parsedXML = parser.parse(xml);
	const mappedCompletedMultipartUpload: CompletedMultipartUpload = map(
		parsedXML,
		{
			Parts: [
				'Part',
				value => emptyArrayGuard(value, deserializeCompletedPartList),
			],
		},
	);

	if (!isEqual(input, mappedCompletedMultipartUpload)) {
		throw new IntegrityError();
	}
}
