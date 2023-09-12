// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export declare const __modelMeta__: unique symbol;

export type ExtractModelMeta<T extends Record<any, any>> =
	T[typeof __modelMeta__];

export type ModelTypes<
	T extends Record<any, any> = never,
	ModelMeta extends Record<any, any> = any
> = any;
