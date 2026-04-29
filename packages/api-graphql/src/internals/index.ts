// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { generateClient as _generateClient } from './generateClient';

export {
	createInternalGraphQLAPI,
	InternalGraphQLAPIClass,
} from './InternalGraphQLAPI';

export { graphql, cancel, isCancelError } from './v6';
export { generateClient } from './generateClient';
export { CommonPublicClientOptions, DefaultCommonClientOptions } from './types';

/** @deprecated Use generateClient instead. */
export function generateClientWithAmplifyInstance<
	_T extends Record<any, any> = never,
	ClientType = any,
>(...args: any[]): ClientType {
	return (_generateClient as any)(...args);
}
