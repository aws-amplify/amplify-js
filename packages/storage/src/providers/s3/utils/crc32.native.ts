// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CRC32Checksum } from './crc32';

export const calculateContentCRC32 = async (
	content: Blob | string | ArrayBuffer | ArrayBufferView,
	_seed = 0,
): Promise<CRC32Checksum | undefined> => {
	return undefined;
};
