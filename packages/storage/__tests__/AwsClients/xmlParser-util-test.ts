import cases from './xmlParser-fixture';
import { parser as browserParser } from '../../src/AwsClients/S3/utils/xmlParser.browser';
import { parser as nodeParser } from '../../src/AwsClients/S3/utils/xmlParser';

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
