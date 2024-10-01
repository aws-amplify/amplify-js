// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Ensures the cookie names are encoded in order to look up the cookie store
// that is manipulated by js-cookie on the client side.
// Details of the js-cookie encoding behavior see:
// https://github.com/js-cookie/js-cookie#encoding
// The implementation is borrowed from js-cookie without escaping `[()]` as
// we are not using those chars in the auth keys.
export const ensureEncodedForJSCookie = (name: string): string =>
	encodeURIComponent(name).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent);
