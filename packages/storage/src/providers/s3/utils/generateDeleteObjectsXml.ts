// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Escapes special XML characters in a string
 * @param str - String to escape
 * @returns XML-escaped string
 */
const escapeXml = (str: string): string => {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
};

/**
 * Generates XML for S3 batch delete operations
 *
 * @param objects - Array of objects to delete with their keys
 * @param quiet - Whether to use quiet mode (default: true)
 * @returns XML string for the delete request
 */
export const generateDeleteObjectsXml = (
	objects: { Key: string }[],
	quiet: boolean,
): string => {
	const objectsXml = objects
		.map(obj => `<Object><Key>${escapeXml(obj.Key)}</Key></Object>`)
		.join('');

	return `<?xml version="1.0" encoding="UTF-8"?>
<Delete xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
	<Quiet>${quiet ? 'true' : 'false'}</Quiet>
	${objectsXml}
</Delete>`;
};
