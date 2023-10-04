// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify } from '@aws-amplify/core';

import { post as internalPost } from '../apis/common/internalPost';
import { InternalPostInput } from '../types';

/**
 * Internal-only REST POST handler to send GraphQL request to given endpoint. By default, it will use IAM to authorize
 * the request. In some auth modes, the IAM auth has to be disabled. Here's how to set up the request auth correctly:
 * * If auth mode is 'iam', you MUST NOT set 'authorization' header and 'x-api-key' header, since it would disable IAM
 *   auth. You MUST also set 'input.options.signingServiceInfo' option.
 *   * The including 'input.options.signingServiceInfo.service' and 'input.options.signingServiceInfo.region' are
 *     optional. If omitted, the signing service and region will be inferred from url.
 * * If auth mode is 'none', you MUST NOT set 'options.signingServiceInfo' option.
 * * If auth mode is 'apiKey', you MUST set 'x-api-key' custom header.
 * * If auth mode is 'oidc' or 'lambda' or 'userPool', you MUST set 'authorization' header.
 *
 * To make the internal post cancellable, you must also call `updateRequestToBeCancellable()` with the promise from
 * internal post call and the abort controller supplied to the internal post call.
 *
 * @internal
 */
export const post = (input: InternalPostInput) => {
	return internalPost(Amplify, input);
};

export {
	cancel,
	updateRequestToBeCancellable,
} from '../apis/common/internalPost';
