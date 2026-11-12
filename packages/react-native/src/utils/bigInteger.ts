// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { RTNCore } from '../types';

// The 3072-bit SRP group prime used by Amazon Cognito (RFC 5054). It matches
// the value hard-coded in the iOS and Android implementations of `computeS`.
const N_HEX =
	'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1' +
	'29024E088A67CC74020BBEA63B139B22514A08798E3404DD' +
	'EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245' +
	'E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED' +
	'EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3D' +
	'C2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F' +
	'83655D23DCA3AD961C62F356208552BB9ED529077096966D' +
	'670C354E4ABC9804F1746C08CA18217C32905E462E36CE3B' +
	'E39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9' +
	'DE2BCBF6955817183995497CEA956AE515D2261898FA0510' +
	'15728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64' +
	'ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7' +
	'ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6B' +
	'F12FFA06D98A0864D87602733EC86A64521F2B18177B200C' +
	'BBE117577A615D6C770988C0BAD946E208E24FA074E5AB31' +
	'43DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF';

const HEX_PATTERN = /^-?[0-9a-fA-F]+$/;

const ZERO = BigInt(0);
const ONE = BigInt(1);

const parseHex = (payload: Record<string, string>, key: string): bigint => {
	const value = payload[key];
	if (typeof value !== 'string' || !HEX_PATTERN.test(value)) {
		throw new Error(`Invalid value for \`${key}\``);
	}

	return value.startsWith('-')
		? -BigInt(`0x${value.slice(1)}`)
		: BigInt(`0x${value}`);
};

/** Non-negative remainder, matching `java.math.BigInteger#mod`. */
const mod = (value: bigint, modulus: bigint): bigint => {
	const remainder = value % modulus;

	return remainder < ZERO ? remainder + modulus : remainder;
};

/**
 * Returns a function that reduces `0 <= x < modulus^2` modulo `modulus` using
 * Barrett reduction. BigInt division is far slower than multiplication on some
 * JavaScript engines (notably Hermes), so this keeps division out of the
 * exponentiation loop: it costs one division per modulus instead of one per
 * step.
 */
const createReducer = (modulus: bigint) => {
	const k = BigInt(modulus.toString(2).length);
	const kMinusOne = k - ONE;
	const kPlusOne = k + ONE;
	const mu = (ONE << (k + k)) / modulus;

	return (x: bigint): bigint => {
		const q = ((x >> kMinusOne) * mu) >> kPlusOne;
		let r = x - q * modulus;
		while (r >= modulus) {
			r -= modulus;
		}

		return r;
	};
};

/** Left-to-right binary modular exponentiation. */
const modPow = (base: bigint, exponent: bigint, modulus: bigint): bigint => {
	if (modulus <= ZERO) {
		throw new Error('Modulus must be positive');
	}
	if (exponent < ZERO) {
		throw new Error('Exponent must not be negative');
	}

	const reduce = createReducer(modulus);
	const b = mod(base, modulus);
	let result = mod(ONE, modulus);
	for (const bit of exponent.toString(2)) {
		result = reduce(result * result);
		if (bit === '1') {
			result = reduce(result * b);
		}
	}

	return result;
};

/**
 * JavaScript equivalent of the native `computeModPow`, used when the native
 * module is not linked.
 *
 * @internal
 */
export const computeModPowInJs: RTNCore['computeModPow'] = async payload => {
	const base = parseHex(payload, 'base');
	const exponent = parseHex(payload, 'exponent');
	const divisor = parseHex(payload, 'divisor');

	return modPow(base, exponent, divisor).toString(16);
};

/**
 * JavaScript equivalent of the native `computeS`, used when the native module
 * is not linked. Computes `(B - k * g^x) ^ (a + u * x) mod N`.
 *
 * @internal
 */
export const computeSInJs: RTNCore['computeS'] = async payload => {
	const N = BigInt(`0x${N_HEX}`);
	const g = parseHex(payload, 'g');
	const x = parseHex(payload, 'x');
	const k = parseHex(payload, 'k');
	const a = parseHex(payload, 'a');
	const b = parseHex(payload, 'b');
	const u = parseHex(payload, 'u');

	const exponent = a + u * x;
	const base = b - k * modPow(g, x, N);

	return modPow(base, exponent, N).toString(16);
};
