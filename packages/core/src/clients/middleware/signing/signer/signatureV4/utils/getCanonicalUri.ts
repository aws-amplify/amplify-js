// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Returns a canonical uri.
 *
 * @param pathname `pathname` from request url.
 * @param uriEscapePath Whether to uri encode the path as part of canonical uri. It's used for S3 only where the
 *   pathname is already uri encoded, and the signing process is not expected to uri encode it again. Defaults to true.
 * @returns URI-encoded version of the absolute path component URL (everything between the host and the question mark
 * character (?) that starts the query string parameters). If the absolute path is empty, a forward slash character (/).
 *
 * @internal
 */
export const getCanonicalUri = (
	pathname: string,
	uriEscapePath = true
): string =>
	pathname
		? uriEscapePath
			? encodeURIComponent(pathname).replace(/%2F/g, '/')
			: pathname
		: '/';
