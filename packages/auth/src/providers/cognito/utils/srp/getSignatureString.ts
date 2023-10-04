// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Sha256 } from '@aws-crypto/sha256-js';
import { SourceData } from '@smithy/types';
import {
	base64Decoder,
	base64Encoder,
} from '@aws-amplify/core/internals/utils';

export const getSignatureString = ({
	userPoolName,
	username,
	challengeParameters,
	dateNow,
	hkdf,
}: {
	userPoolName: string;
	username: string;
	challengeParameters: Record<string, any>;
	dateNow: string;
	hkdf: SourceData;
}): string => {
	const encoder = new TextEncoder();

	const bufUPIDaToB = encoder.encode(userPoolName);
	const bufUNaToB = encoder.encode(username);
	const bufSBaToB = urlB64ToUint8Array(challengeParameters.SECRET_BLOCK);
	const bufDNaToB = encoder.encode(dateNow);

	const bufConcat = new Uint8Array(
		bufUPIDaToB.byteLength +
			bufUNaToB.byteLength +
			bufSBaToB.byteLength +
			bufDNaToB.byteLength
	);
	bufConcat.set(bufUPIDaToB, 0);
	bufConcat.set(bufUNaToB, bufUPIDaToB.byteLength);
	bufConcat.set(bufSBaToB, bufUPIDaToB.byteLength + bufUNaToB.byteLength);
	bufConcat.set(
		bufDNaToB,
		bufUPIDaToB.byteLength + bufUNaToB.byteLength + bufSBaToB.byteLength
	);

	const awsCryptoHash = new Sha256(hkdf);
	awsCryptoHash.update(bufConcat);
	const resultFromAWSCrypto = awsCryptoHash.digestSync();
	const signatureString = base64Encoder.convert(resultFromAWSCrypto);
	return signatureString;
};

const urlB64ToUint8Array = (base64String: string): Uint8Array => {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, '+')
		.replace(/_/g, '/');

	const rawData = base64Decoder.convert(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
};
