// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { FormattedDates } from '../types/signer';

/**
 * Returns expected date strings to be used in signing.
 *
 * @param date JavaScript `Date` object.
 * @returns `FormattedDates` object containing the following:
 * - longDate: A date string in 'YYYYMMDDThhmmssZ' format
 * - shortDate: A date string in 'YYYYMMDD' format
 *
 * @internal
 */
export const getFormattedDates = (date: Date): FormattedDates => {
	const longDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');

	return {
		longDate,
		shortDate: longDate.slice(0, 8),
	};
};
