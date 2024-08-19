// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ContentDisposition } from '../types/options';

export const constructContentDisposition = (
	contentDisposition?: string | ContentDisposition,
): string | undefined => {
	if (!contentDisposition) return undefined;

	if (typeof contentDisposition === 'string') return contentDisposition;

	const { type, filename } = contentDisposition;

	return filename !== undefined ? `${type}; filename="${filename}"` : type;
};
