import { AmplifyClassV6 } from '@aws-amplify/core';
import { graphql, cancel, isCancelError } from './v6';
import { V6Client, __amplify } from '../types';

type ClientGenerationParams = {
	amplify: AmplifyClassV6;
};

/**
 * @private
 *
 * Creates a client that can be used to make GraphQL requests, using a provided `AmplifyClassV6`
 * compatible context object for config and auth fetching.
 *
 * @param params
 * @returns
 */
export function generateClient(params: ClientGenerationParams): V6Client {
	return {
		[__amplify]: params.amplify,
		graphql,
		cancel,
		isCancelError,
	};
}
