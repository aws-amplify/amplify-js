/**
 * Drop-in replacement for fast-xml-parser's XmlParser class used in the AWS SDK
 * S3 client XML deserializer. This implementation is not tested against the full
 * xml conformance test suite. It is only tested against the XML responses from
 * S3.
 *
 * This implementation requires the browser's `DOMParser`.
 *
 * This parser is to imitate fast-xml-parser behavior when it's instantiated with parameters as below:
 *
 * https://github.com/aws/aws-sdk-js-v3/blob/f7c9bfc35924cef875cea1176de2ef0fecf02ae0/clients/client-s3/src/protocols/Aws_restXml.ts#L12939
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
			return parseTextOnlyElementNode(node);
		}

		const nodeValue = {};
		for (let i = 0; i < node.attributes.length; i++) {
			const attr = node.attributes[i];
			if (!isNamespaceAttributeName(attr.nodeName)) {
				nodeValue[attr.nodeName] = attr.nodeValue!;
			}
		}

		// convert child nodes
		if (node.children.length > 0) {
			for (let i = 0; i < node.children.length; i++) {
				const child = node.children[i];
				const childValue = parseXmlNode(child);
				if (childValue !== undefined) {
					const childName = child.nodeName;
					if (nodeValue[childName] === undefined) {
						nodeValue[childName] = childValue;
					} else {
						if (Array.isArray(nodeValue[childName])) {
							nodeValue[childName].push(childValue);
						} else {
							nodeValue[childName] = [nodeValue[childName], childValue];
						}
					}
				}
			}
		}

		return Object.keys(nodeValue).length === 0 ? '' : nodeValue;
	}
};

const isElementNode = (node: Node): node is Element =>
	node.nodeType === Node.ELEMENT_NODE;

const isDocumentNode = (node: Node): node is Document =>
	node.nodeType === Node.DOCUMENT_NODE;

const isNamespaceAttributeName = (name: string): boolean =>
	name === 'xmlns' || name.startsWith('xmlns:');

// Check if the node has attributes other than xmlns
const hasAttributes = (node: Element): boolean => {
	let hasAttributes = false;
	for (let i = 0; i < node.attributes.length; i++) {
		const attr = node.attributes[i];
		if (!isNamespaceAttributeName(attr.nodeName)) {
			hasAttributes = true;
			break;
		}
	}
	return hasAttributes;
};

const isTextOnlyElementNode = (node: Element): boolean =>
	!hasAttributes(node) &&
	node.children.length === 0 &&
	node.firstChild?.nodeType === Node.TEXT_NODE;

const parseTextOnlyElementNode = (node: Element): string | undefined =>
	node.childNodes[0]?.nodeValue!;
