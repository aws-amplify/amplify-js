// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

let token: string;

/**
 * Sets token.
 *
 * @internal
 */
export const setToken = (newToken: string) => {
	token = newToken;
};

/**
 * Returns the current token.
 *
 * @internal
 */
export const getToken = () => token;
