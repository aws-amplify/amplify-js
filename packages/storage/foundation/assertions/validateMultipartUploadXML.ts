// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { IntegrityError } from '../../src/errors/IntegrityError';
import { parser } from '../../src/providers/s3/utils/client/runtime';
import { CompletedMultipartUpload } from '../../src/providers/s3/utils/client/s3data/types';
import {
	deserializeCompletedPartList,
	emptyArrayGuard,
	map,
} from '../../src/providers/s3/utils/client/utils';
import { isEqual } from '../../src/providers/s3/utils/client/utils/integrityHelpers';

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
