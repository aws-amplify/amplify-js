// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CognitoJwtVerifier } from 'aws-jwt-verify';

export { NextServer } from './NextServer';

export type JwtVerifier = ReturnType<typeof CognitoJwtVerifier.create>;
