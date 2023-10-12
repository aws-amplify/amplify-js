import { AmplifyClassV6 } from '@aws-amplify/core';

/**
 * @private
 *
 * The knobs available for configuring `generateClient` internally.
 */
export type ClientGenerationParams = {
	amplify: AmplifyClassV6;
};
