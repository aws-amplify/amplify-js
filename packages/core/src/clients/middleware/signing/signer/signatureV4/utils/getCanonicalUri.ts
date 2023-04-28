// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Returns a canonical uri.
 *
 * @param pathname `pathname` from request url.
 * @returns URI-encoded version of the absolute path component URL (everything between the host and the question mark
 * character (?) that starts the query string parameters). If the absolute path is empty, a forward slash character (/).
 *
 * @internal
 */
export const getCanonicalUri = (pathname: string): string =>
	pathname ? encodeURIComponent(pathname).replace(/%2F/g, '/') : '/';
