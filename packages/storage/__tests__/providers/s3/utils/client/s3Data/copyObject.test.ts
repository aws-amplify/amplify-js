import { validateCopyObjectHeaders } from '../../../../../../src/providers/s3/utils/client/s3data/copyObject';

describe('validateCopyObjectHeaders', () => {
	const baseRequest: any = { CopySource: 'mock-source' };
	const baseHeaders: any = { 'x-amz-copy-source': 'mock-source' };

	[
		{
			description: 'when only correct copy source is provided',
			request: baseRequest,
			headers: baseHeaders,
			expectPass: true,
		},
		{
			description: 'when optional headers are provided correctly',
			request: {
				...baseRequest,
				MetadataDirective: 'mock-metadata',
				CopySourceIfMatch: 'mock-etag',
				CopySourceIfUnmodifiedSince: new Date(0),
			},
			headers: {
				...baseHeaders,
				'x-amz-metadata-directive': 'mock-metadata',
				'x-amz-copy-source-if-match': 'mock-etag',
				'x-amz-copy-source-if-unmodified-since': '1970-01-01T00:00:00.000Z',
			},
			expectPass: true,
		},
		{
			description: 'when optional headers are added without request',
			request: baseRequest,
			headers: {
				...baseHeaders,
				'x-amz-metadata-directive': 'mock-metadata',
				'x-amz-copy-source-if-match': 'mock-etag',
				'x-amz-copy-source-if-unmodified-since': '1970-01-01T00:00:00.000Z',
			},
			expectPass: false,
		},
		...[null, undefined, 'wrong-metadata'].map(incorrectHeader => ({
			description: `when metadata is not mapped correctly: ${incorrectHeader}`,
			request: {
				...baseRequest,
				MetadataDirective: 'mock-metadata',
			},
			headers: {
				...baseHeaders,
				'x-amz-metadata-directive': incorrectHeader,
			},
			expectPass: false,
		})),
		...[null, undefined, 'wrong-etag'].map(incorrectHeader => ({
			description: `when source etag is not mapped correctly: ${incorrectHeader}`,
			request: {
				...baseRequest,
				CopySourceIfMatch: 'mock-etag',
			},
			headers: {
				...baseHeaders,
				'x-amz-copy-source-if-match': incorrectHeader,
			},
			expectPass: false,
		})),
		...[null, undefined, 'wrong-date'].map(incorrectHeader => ({
			description: `when unmodified since date is not mapped correctly: ${incorrectHeader}`,
			request: {
				...baseRequest,
				CopySourceIfUnmodifiedSince: new Date(0),
			},
			headers: {
				...baseHeaders,
				'x-amz-copy-source-if-unmodified-since': incorrectHeader,
			},
			expectPass: false,
		})),
	].forEach(({ description, request, headers, expectPass }) => {
		describe(description, () => {
			if (expectPass) {
				it('should pass validation', () => {
					try {
						validateCopyObjectHeaders(request, headers);
					} catch (_) {
						fail('test case should succeed');
					}
				});
			} else {
				it('should fail validation', () => {
					try {
						validateCopyObjectHeaders(request, headers);
						fail('test case should fail');
					} catch (e: any) {
						expect(e.name).toBe('Unknown');
					}
				});
			}
		});
	});
});
