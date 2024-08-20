// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpRequest } from '@aws-amplify/core/internals/aws-client-utils';

import { SigningServiceInfo } from '../types';

/**
 * Determines if IAM authentication should be applied for a GraphQL request.
 *
 * This function checks the `headers` of the HTTP request to determine if IAM authentication
 * is applicable. IAM authentication is considered applicable if there is no `authorization`
 * header, no `x-api-key` header, and `signingServiceInfo` is provided.
 *
 * @param request - The HTTP request object containing headers.
 * @param signingServiceInfo - Optional signing service information,
 * including service and region.
 * @returns A boolean `true` if IAM authentication should be applied.
 *
 * @internal
 */
export const isIamAuthApplicableForGraphQL = (
	{ headers }: HttpRequest,
	signingServiceInfo?: SigningServiceInfo,
) => !headers.authorization && !headers['x-api-key'] && !!signingServiceInfo;

/**
 * Determines if IAM authentication should be applied for a REST request.
 *
 * This function checks the `headers` of the HTTP request to determine if IAM authentication
 * is applicable. IAM authentication is considered applicable if there is no `authorization`
 * header and `signingServiceInfo` is provided.
 *
 * @param request - The HTTP request object containing headers.
 * @param signingServiceInfo - Optional signing service information,
 * including service and region.
 * @returns A boolean `true` if IAM authentication should be applied.
 *
 * @internal
 */
export const isIamAuthApplicableForRest = (
	{ headers }: HttpRequest,
	signingServiceInfo?: SigningServiceInfo,
) => !headers.authorization && !!signingServiceInfo;
