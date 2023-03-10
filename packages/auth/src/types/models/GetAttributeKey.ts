// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO(haverchuck): change 'T:string' to '`custom:${string}`' when ts version bumped
export type GetAttributeKey<T> = T extends string ? T : string;
