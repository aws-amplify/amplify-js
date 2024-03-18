// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

type UnionKeys<T> = T extends T ? keyof T : never;

type StrictUnionHelper<T, TAll> = T extends any
	? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, never>>
	: never;

/**
 * Makes a union 'strict', such that members are disallowed from including the keys of other members. E.g.,
 * `{x: 1, y: 1}` is a valid member of `{x: number} | {y: number}` but not of StrictUnion<{x: number} | {y: number}>.
 */
export type StrictUnion<T> = StrictUnionHelper<T, T>;
