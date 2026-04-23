// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
export {
	createInternalGraphQLAPI,
	InternalGraphQLAPIClass,
} from './InternalGraphQLAPI';

export { graphql, cancel, isCancelError } from './v6';
export { generateClient } from './generateClient';
export { CommonPublicClientOptions, DefaultCommonClientOptions } from './types';

import { generateClient as _generateClient } from './generateClient';

/** @deprecated Use generateClient instead. */
export function generateClientWithAmplifyInstance<
	T extends Record<any, any> = never,
	ClientType = any,
>(...args: any[]): ClientType {
	return (_generateClient as any)(...args);
}
