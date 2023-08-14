// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyError } from '../../Errors';
import { ErrorParams } from '../../types';

export function asserts(
	assertion: boolean,
	errorParams: ErrorParams
): asserts assertion {
	if (!assertion) throw new AmplifyError(errorParams);
}
