// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TODO(S3AG-preview): DELETE THIS FILE when InstanceScope reaches GA.
 *
 * S3 Access Grants cross-account sharing (InstanceScope) is in internal
 * availability (IA). The `InstanceScope` request parameter and the
 * `AccessGrantsInstanceArn` grant field are not yet in the generated s3control
 * SDK types (`./types.ts`). To avoid editing the generated file (and a clash
 * when the real SDK ships these at GA), the preview-only type additions live
 * here. At GA, delete this file and fold these members into `./types.ts`
 * (`grep -rn "S3AG-preview" packages/storage/src` finds the few call sites that
 * import from here). Param/field names and enum spellings are a best-effort
 * guess against the IA API (ref CR-279796260) and must be reconciled before GA.
 */

import type {
	ListCallerAccessGrantsCommandOutput,
	ListCallerAccessGrantsEntry,
} from './types';

/**
 * The scope of the InstanceScope filter applied to S3 Access Grants queries:
 * - `SELF` (default): only the caller's own S3 Access Grants instance.
 * - `ALL`: the caller's instance plus every instance RAM-shared directly with it.
 */
export const InstanceScope = {
	SELF: 'SELF',
	ALL: 'ALL',
} as const;

export type InstanceScope = (typeof InstanceScope)[keyof typeof InstanceScope];

/**
 * The ARN of the S3 Access Grants instance that owns this grant. For a grant
 * surfaced via `InstanceScope=ALL`, this identifies the owning (possibly
 * cross-account) instance; the account id parsed from it is used downstream as
 * the per-location `expectedBucketOwner`.
 */
export interface ListCallerAccessGrantsEntryWithOwner
	extends ListCallerAccessGrantsEntry {
	AccessGrantsInstanceArn?: string;
}

/**
 * `ListCallerAccessGrantsCommandOutput` whose grant entries carry the owning
 * instance ARN. Lets the deserializer tests assert `AccessGrantsInstanceArn`
 * without widening the generated output type.
 */
export interface ListCallerAccessGrantsOutputWithOwner
	extends Omit<ListCallerAccessGrantsCommandOutput, 'CallerAccessGrantsList'> {
	CallerAccessGrantsList?: ListCallerAccessGrantsEntryWithOwner[];
}
