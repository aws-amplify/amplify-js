// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NativeError } from './types';

/**
 * @internal
 */
export const getIsNativeError = (err: unknown): err is NativeError => {
	return err instanceof Error && 'code' in err && 'domain' in err;
};
