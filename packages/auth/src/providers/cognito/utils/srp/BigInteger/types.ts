// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface BigIntegerInterface {
	new (a?: any, b?: any): BigIntegerInterface;
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
	fromInt: (num: number) => void;
	toString: (radix: number) => string;
}
