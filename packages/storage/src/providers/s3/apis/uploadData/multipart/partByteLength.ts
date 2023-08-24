// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { byteLength } from '../byteLength';

type PartData = ArrayBuffer | string | Blob;
export const partByteLength = (partData: PartData): number =>
	byteLength(partData)!;
