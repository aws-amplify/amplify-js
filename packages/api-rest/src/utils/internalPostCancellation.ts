// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpResponse } from '@aws-amplify/core/lib-esm/clients';

export const updateRequestToBeCancellable = (
	promise: Promise<HttpResponse>,
	controller: AbortController
) => {};
