// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ContentDisposition } from '../types/options';

export const constructContentDisposition = (
	contentDisposition?: string | ContentDisposition,
): string | undefined => {
	if (typeof contentDisposition === 'object') {
		const { type, filename } = contentDisposition;

		return filename ? `${type}; filename="${filename}"` : type;
	}

	return contentDisposition;
};
