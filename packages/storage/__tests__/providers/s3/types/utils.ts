// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type Expect<T extends true> = T;

export type Equal<X, Y> = X extends Y ? true : false;
