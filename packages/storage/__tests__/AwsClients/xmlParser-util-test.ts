import { parser as browserParser } from '../../src/AwsClients/S3/xmlParser.browser';
import { parser as nodeParser } from '../../src/AwsClients/S3/xmlParser';
import cases from './xmlParser-fixture';

describe('xmlParser for browsers', () => {
	cases.forEach(({ spec, xml, expected }) => {
		it(`should parse ${spec} correctly`, () => {
			expect(browserParser.parse(xml)).toEqual(expected);
		});
	});
});

describe('xmlParser for non-browsers', () => {
	cases.forEach(({ spec, xml, expected }) => {
		it(`should parse ${spec} correctly`, () => {
			expect(nodeParser.parse(xml)).toEqual(expected);
		});
	});
});
