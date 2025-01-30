// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	ChallengeName,
	ChallengeParameters,
} from '../../../foundation/factories/serviceClients/cognitoIdentityProvider/types';
import { AuthSignInOutput } from '../../../types';

export type WebAuthnSignInResult =
	| AuthSignInOutput
	| {
			challengeName: ChallengeName;
			challengeParameters: ChallengeParameters;
	  };
