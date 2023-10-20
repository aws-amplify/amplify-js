// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyClassV6 } from '@aws-amplify/core';

/**
 * @private
 *
 * The knobs available for configuring `generateClient` internally.
 */
export type ClientGenerationParams = {
	amplify:
		| AmplifyClassV6
		| ((fn: (amplify: any) => Promise<any>) => Promise<AmplifyClassV6>);
	config?: object;
};
