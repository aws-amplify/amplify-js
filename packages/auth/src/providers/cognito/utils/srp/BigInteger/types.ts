/* eslint-disable */
// @ts-nocheck -> BigInteger is already a vended utility

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface AuthBigInteger {
	new (a?: any, b?: any): AuthBigInteger;
	subtract: Function;
	add: Function;
	multiply: Function;
	mod: Function;
	modPow: Function;
	equals: Function;
	ONE: any;
	ZERO: any;
	abs: Function;
	compareTo: Function;
	fromInt(num: number): void;
	toString(radix: number): string;
}
