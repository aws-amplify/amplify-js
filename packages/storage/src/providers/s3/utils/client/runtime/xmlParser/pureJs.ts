// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { XMLParser } from 'fast-xml-parser';

/**
 * Pure JS XML parser that can be used in Non-browser environments, like React Native and Node.js. This is the same
 * XML parser implementation as used in AWS SDK S3 client. It depends on pure JavaScript XML parser library
 * `fast-xml-parser`.
 *
 * Ref: https://github.com/aws/aws-sdk-js-v3/blob/1e806ba3f4a83c9e3eb0b41a3a7092da93826b8f/clients/client-s3/src/protocols/Aws_restXml.ts#L12938-L12959
 */
export const parser = {
	parse: (xmlStr: string): any => {
		const parser = new XMLParser({
			attributeNamePrefix: '',
			htmlEntities: true,
			ignoreAttributes: false,
			ignoreDeclaration: true,
			parseTagValue: false,
			trimValues: false,
			removeNSPrefix: true,
			tagValueProcessor: (_, val) =>
				val.trim() === '' && val.includes('\n') ? '' : undefined,
		});
		parser.addEntity('#xD', '\r');
		parser.addEntity('#10', '\n');
		const parsedObj: any = parser.parse(xmlStr);
		const textNodeName = '#text';
		const key = Object.keys(parsedObj)[0];
		const parsedObjToReturn = parsedObj[key];
		if (parsedObjToReturn[textNodeName]) {
			parsedObjToReturn[key] = parsedObjToReturn[textNodeName];
			delete parsedObjToReturn[textNodeName];
		}
		return getValueFromTextNode(parsedObjToReturn);
	},
};

/**
 * Recursively parses object and populates value is node from "#text" key if it's available
 *
 * Ref: https://github.com/aws/aws-sdk-js-v3/blob/6b4bde6f338720abf28b931f8a4506613bd64d3f/packages/smithy-client/src/get-value-from-text-node.ts#L1
 */
const getValueFromTextNode = (obj: any) => {
	const textNodeName = '#text';
	for (const key in obj) {
		if (obj.hasOwnProperty(key) && obj[key][textNodeName] !== undefined) {
			obj[key] = obj[key][textNodeName];
		} else if (typeof obj[key] === 'object' && obj[key] !== null) {
			obj[key] = getValueFromTextNode(obj[key]);
		}
	}
	return obj;
};
