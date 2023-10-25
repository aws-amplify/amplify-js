// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyClassV6, ResourcesConfig } from '@aws-amplify/core';

/**
 * @private
 *
 * The knobs available for configuring `generateClient` internally.
 */
export type ClientGenerationParams = {
	amplify: AmplifyClassV6;
};

/**
 * @private
 *
 * The knobs available for configuring `server/generateClient` internally.
 */
export type ServerClientGenerationParams = {
	amplify:
		| null // null expected when used with `generateServerClient`
		| ((fn: (amplify: any) => Promise<any>) => Promise<AmplifyClassV6>); // closure expected with `generateServerClientUsingCookies`
	// global env-sourced config use for retrieving modelIntro
	config: ResourcesConfig;
};
