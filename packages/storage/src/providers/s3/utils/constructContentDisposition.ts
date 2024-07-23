// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { GetUrlOptions } from '@aws-amplify/storage/src/providers/s3/types/options';

export const constructContentDisposition = (
	contentDisposition?: GetUrlOptions['contentDisposition'],
): string | undefined => {
	if (typeof contentDisposition === 'string') return contentDisposition;

	if (typeof contentDisposition === 'object') {
		const { type, filename } = contentDisposition;

		return filename ? `${type}; filename="${filename}"` : type;
	}

	return undefined;
};
