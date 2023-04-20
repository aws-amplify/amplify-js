/**
 * Drop-in replacement for fast-xml-parser's XmlParser class used in the AWS SDK
 * S3 client XML deserializer. The original class was instantiated with parameter
 * as below, ref: https://github.com/aws/aws-sdk-js-v3/blob/f7c9bfc35924cef875cea1176de2ef0fecf02ae0/clients/client-s3/src/protocols/Aws_restXml.ts#L12939
 * ```javascript
 * const parser = new XMLParser({
 * 	attributeNamePrefix: "",
 * 	htmlEntities: true,
 * 	ignoreAttributes: false,
 * 	ignoreDeclaration: true,
 * 	parseTagValue: false,
 * 	trimValues: false,
 * 	tagValueProcessor: (_, val) => (val.trim() === "" && val.includes("\n") ? "" : undefined),
 * });
 * ```
 *
 * This component relies on the browser's DOMParser. Platforms without DOMParser(e.g., React Native, Node.js) will still
 * use the fast-xml-parser dependency.
 */
export const parser = {
	parse: (xmlStr: string): any => {
		const domParser = new DOMParser();
		const xml = domParser.parseFromString(xmlStr, 'text/xml');
	},
};
