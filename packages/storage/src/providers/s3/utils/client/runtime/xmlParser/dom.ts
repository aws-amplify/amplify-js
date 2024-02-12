// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Drop-in replacement for fast-xml-parser's XmlParser class used in the AWS SDK S3 client XML deserializer. This
 * implementation is not tested against the full xml conformance test suite. It is only tested against the XML responses
 * from S3. This implementation requires the `DOMParser` class in the runtime.
 */
export const parser = {
	parse: (xmlStr: string): any => {
		const domParser = new DOMParser();
		const xml = domParser.parseFromString(xmlStr, 'text/xml');
		const parsedObj = parseXmlNode(xml);
		const rootKey = Object.keys(parsedObj)[0];

		return parsedObj[rootKey];
	},
};

const parseXmlNode = (node: Node): any => {
	if (isDocumentNode(node)) {
		return {
			[node.documentElement.nodeName]: parseXmlNode(node.documentElement),
		};
	}

	if (node.nodeType === Node.TEXT_NODE) {
		return node.nodeValue?.trim();
	}

	if (isElementNode(node)) {
		// Node like <Location>foo</Location> will be converted to { Location: 'foo' }
		// instead of { Location: { '#text': 'foo' } }.
		if (isTextOnlyElementNode(node)) {
			return node.childNodes[0].nodeValue!;
		}

		const nodeValue: Record<string, any> = {};
		// convert attributes
		for (const attr of node.attributes) {
			if (!isNamespaceAttributeName(attr.nodeName)) {
				nodeValue[attr.nodeName] = attr.nodeValue!;
			}
		}

		// convert child nodes
		if (node.children.length > 0) {
			for (const child of node.children) {
				const childValue = parseXmlNode(child);
				if (childValue === undefined) {
					continue;
				}
				const childName = child.nodeName;
				if (nodeValue[childName] === undefined) {
					nodeValue[childName] = childValue;
				} else if (Array.isArray(nodeValue[childName])) {
					nodeValue[childName].push(childValue);
				} else {
					nodeValue[childName] = [nodeValue[childName], childValue];
				}
			}
		}

		// Return empty element node as empty string instead of `{}`, which is the default behavior of fast-xml-parser.
		return Object.keys(nodeValue).length === 0 ? '' : nodeValue;
	}
};

const isElementNode = (node: Node): node is Element =>
	node.nodeType === Node.ELEMENT_NODE;

const isDocumentNode = (node: Node): node is Document =>
	node.nodeType === Node.DOCUMENT_NODE;

const isTextOnlyElementNode = (node: Element): boolean =>
	hasOnlyNamespaceAttributes(node) &&
	node.children.length === 0 &&
	node.firstChild?.nodeType === Node.TEXT_NODE;

const hasOnlyNamespaceAttributes = (node: Element): boolean => {
	for (const attr of node.attributes) {
		if (!isNamespaceAttributeName(attr.nodeName)) {
			return false;
		}
	}

	return true;
};

const isNamespaceAttributeName = (name: string): boolean =>
	name === 'xmlns' || name.startsWith('xmlns:');
