// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KEY_TYPE_IDENTIFIER } from '../constants';

/**
 * Returns the credential scope which restricts the resulting signature to the specified region and service.
 *
 * @param date Current date in the format 'YYYYMMDD'.
 * @param region AWS region in which the service resides.
 * @param service Service to which the signed request is being sent.
 *
 * @returns  A string representing the credential scope with format 'YYYYMMDD/region/service/aws4_request'.
 *
 * @internal
 */
export const getCredentialScope = (
	date: string,
	region: string,
	service: string,
): string => `${date}/${region}/${service}/${KEY_TYPE_IDENTIFIER}`;
