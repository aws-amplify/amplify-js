// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const obj: {
	oauth_state?: string;
	ouath_pkce_key?: string;
} = {};

export const setState = (state: string) => {
	obj.oauth_state = state;
};

export const getState = () => {
	const oauth_state = obj.oauth_state;
	obj.oauth_state = undefined;
	return oauth_state;
};

export const setPKCE = (private_key: string) => {
	obj.ouath_pkce_key = private_key;
};

export const getPKCE = () => {
	const ouath_pkce_key = obj.ouath_pkce_key;
	obj.ouath_pkce_key = undefined;
	return ouath_pkce_key;
};

export const clearAll = () => {
	obj.ouath_pkce_key = undefined;
	obj.oauth_state = undefined;
};
