// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpRequest } from '@aws-amplify/core/internals/aws-client-utils';

import { SigningServiceInfo } from '../types';

export const isIamAuthApplicableForGraphQL = (
	{ headers }: HttpRequest,
	signingServiceInfo?: SigningServiceInfo,
) => !headers.authorization && !headers['x-api-key'] && !!signingServiceInfo;

export const isIamAuthApplicableForRest = (
	{ headers }: HttpRequest,
	signingServiceInfo?: SigningServiceInfo,
) => !headers.authorization && !!signingServiceInfo;
