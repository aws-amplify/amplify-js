// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const setState = (state: string) => {
	window.sessionStorage.setItem('oauth_state', state);
};

export const getState = () => {
	const oauth_state = window.sessionStorage.getItem('oauth_state');
	window.sessionStorage.removeItem('oauth_state');
	return oauth_state;
};

export const setPKCE = (private_key: string) => {
	window.sessionStorage.setItem('ouath_pkce_key', private_key);
};

export const getPKCE = () => {
	const ouath_pkce_key = window.sessionStorage.getItem('ouath_pkce_key');
	window.sessionStorage.removeItem('ouath_pkce_key');
	return ouath_pkce_key;
};

export const clearAll = () => {
	window.sessionStorage.removeItem('ouath_pkce_key');
	window.sessionStorage.removeItem('oauth_state');
};
