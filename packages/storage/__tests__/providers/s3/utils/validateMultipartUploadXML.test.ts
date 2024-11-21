import { IntegrityError } from '../../../../src/errors/IntegrityError';
import { validateMultipartUploadXML } from '../../../../src/providers/s3/utils/validateMultipartUploadXML';

describe('validateMultipartUploadXML', () => {
	test.each([
		{
			description: 'should NOT throw an error 1 valid part',
			xml: `<CompleteMultipartUpload xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
                <Part>
                    <PartNumber>1</PartNumber>
                    <ChecksumCRC32>checksumValue</ChecksumCRC32>
                </Part>
            </CompleteMultipartUpload>`,
			input: {
				Parts: [{ PartNumber: 1, ChecksumCRC32: 'checksumValue' }],
			},
			success: true,
		},
		{
			description: 'should NOT throw an error 2 valid parts',
			xml: `<CompleteMultipartUpload xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
                <Part>
                    <PartNumber>1</PartNumber>
                    <ChecksumCRC32>checksumValue</ChecksumCRC32>
                </Part>
                <Part>
                    <PartNumber>2</PartNumber>
                    <ChecksumCRC32>checksumValue</ChecksumCRC32>
                </Part>
            </CompleteMultipartUpload>`,
			input: {
				Parts: [
					{ PartNumber: 1, ChecksumCRC32: 'checksumValue' },
					{ PartNumber: 2, ChecksumCRC32: 'checksumValue' },
				],
			},
			success: true,
		},
		{
			description: 'should throw an error if the XML is not valid',
			xml: '>InvalidXML/<',
			input: {},
			success: false,
			notIntegrityError: true,
		},
		{
			description:
				'should throw an integrity error if the XML does not contain Part',
			xml: '<InvalidXML/>',
			input: {},
			success: false,
		},
		{
			description:
				'should throw an integrity error when we have more parts than sent',
			xml: `<CompleteMultipartUpload xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
                <Part>
                    <PartNumber>1</PartNumber>
                    <ChecksumCRC32>checksumValue</ChecksumCRC32>
                </Part>
                <Part>
                    <PartNumber>2</PartNumber>
                    <ChecksumCRC32>checksumValue</ChecksumCRC32>
                </Part>
            </CompleteMultipartUpload>`,
			input: {
				Parts: [{ PartNumber: 1, ChecksumCRC32: 'checksumValue' }],
			},
			success: false,
		},
		{
			description:
				'should throw an integrity error when we have less parts than sent',
			xml: `<CompleteMultipartUpload xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
                <Part>
                    <PartNumber>1</PartNumber>
                    <ChecksumCRC32>checksumValue</ChecksumCRC32>
                </Part>
            </CompleteMultipartUpload>`,
			input: {
				Parts: [
					{ PartNumber: 1, ChecksumCRC32: 'checksumValue' },
					{ PartNumber: 2, ChecksumCRC32: 'checksumValue' },
				],
			},
			success: false,
		},
		{
			description:
				'should throw an integrity error with not matching PartNumber',
			xml: `<CompleteMultipartUpload xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
                <Part>
                    <PartNumber>2</PartNumber>
                    <ChecksumCRC32>notMatchingChecksum</ChecksumCRC32>
                </Part>
            </CompleteMultipartUpload>`,
			input: {
				Parts: [{ PartNumber: 1, ChecksumCRC32: 'checksumValue' }],
			},
			success: false,
		},
		{
			description: 'should throw an integrity error with not matching ETag',
			xml: `<CompleteMultipartUpload xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
                <Part>
                    <PartNumber>1</PartNumber>
                    <ETag>notMatchingChecksum</ETag>
                </Part>
            </CompleteMultipartUpload>`,
			input: {
				Parts: [{ PartNumber: 1, ETag: 'checksumValue' }],
			},
			success: false,
		},
		{
			description:
				'should throw an integrity error with not matching ChecksumCRC32',
			xml: `<CompleteMultipartUpload xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
                <Part>
                    <PartNumber>1</PartNumber>
                    <ChecksumCRC32>notMatchingChecksum</ChecksumCRC32>
                </Part>
            </CompleteMultipartUpload>`,
			input: {
				Parts: [{ PartNumber: 1, ChecksumCRC32: 'checksumValue' }],
			},
			success: false,
		},
		{
			description:
				'should throw an integrity error with not matching ChecksumCRC32C',
			xml: `<CompleteMultipartUpload xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
                <Part>
                    <PartNumber>1</PartNumber>
                    <ChecksumCRC32C>notMatchingChecksum</ChecksumCRC32C>
                </Part>
            </CompleteMultipartUpload>`,
			input: {
				Parts: [{ PartNumber: 1, ChecksumCRC32C: 'checksumValue' }],
			},
			success: false,
		},
		{
			description:
				'should throw an integrity error with not matching ChecksumSHA1',
			xml: `<CompleteMultipartUpload xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
                <Part>
                    <PartNumber>1</PartNumber>
                    <ChecksumSHA1>notMatchingChecksum</ChecksumSHA1>
                </Part>
            </CompleteMultipartUpload>`,
			input: {
				Parts: [{ PartNumber: 1, ChecksumSHA1: 'checksumValue' }],
			},
			success: false,
		},
		{
			description:
				'should throw an integrity error with not matching ChecksumSHA256',
			xml: `<CompleteMultipartUpload xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
                <Part>
                    <PartNumber>1</PartNumber>
                    <ChecksumSHA256>notMatchingChecksum</ChecksumSHA256>
                </Part>
            </CompleteMultipartUpload>`,
			input: {
				Parts: [{ PartNumber: 1, ChecksumSHA256: 'checksumValue' }],
			},
			success: false,
		},
	])(`$description`, ({ input, xml, success, notIntegrityError }) => {
		if (success) {
			expect(() => {
				validateMultipartUploadXML(input, xml);
			}).not.toThrow();
		} else if (notIntegrityError) {
			expect(() => {
				validateMultipartUploadXML(input, xml);
			}).toThrow();
		} else {
			expect(() => {
				validateMultipartUploadXML(input, xml);
			}).toThrow(IntegrityError);
		}
	});
});
