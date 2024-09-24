// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { extendedEncodeURIComponent } from '@aws-amplify/core/internals/aws-client-utils';

/**
 * Serialize the object key to a URL pathname.
 * @see https://github.com/aws/aws-sdk-js-v3/blob/7ed7101dcc4e81038b6c7f581162b959e6b33a04/clients/client-s3/src/protocols/Aws_restXml.ts#L1108
 *
 * @internal
 */
export const serializePathnameObjectKey = (url: URL, key: string) => {
	return (
		url.pathname.replace(/\/$/, '') +
		`/${key.split('/').map(extendedEncodeURIComponent).join('/')}`
	);
};
