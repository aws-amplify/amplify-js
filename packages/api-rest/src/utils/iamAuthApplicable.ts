// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpRequest } from '@aws-amplify/core/internals/aws-client-utils';

interface SigningServiceInfo {
	service?: string;
	region?: string;
}

export const iamAuthApplicableForGraphQL = (
	{ headers }: HttpRequest,
	signingServiceInfo?: SigningServiceInfo,
) => !headers.authorization && !headers['x-api-key'] && !!signingServiceInfo;

export const iamAuthApplicableForPublic = (
	{ headers }: HttpRequest,
	signingServiceInfo?: SigningServiceInfo,
) => !headers.authorization && !!signingServiceInfo;
