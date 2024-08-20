import { isPresignedURLDurable } from '../../../../src/providers/s3/utils/isPresignedUrlDurable';

describe('isPresignedURLDurable', () => {
	const bucket = 'bucket';
	const key = 'key/eresa/rre';
	const bucketWithDots = 'bucket.with.dots';
	const presignedUrl = new URL(
		`https://bucket.s3.amz.com/${key}?params=params`,
	);
	const presignedUrlWithDots = new URL(
		`https://s3.amz.com/bucket.with.dots/${key}?params=params`,
	);

	[
		{
			description: 'bucket without dots',
			input: {
				bucketName: bucket,
				key,
				presignedUrl,
			},
			expected: true,
		},
		{
			description: 'bucket with dots',
			input: {
				bucketName: bucketWithDots,
				key,
				presignedUrl: presignedUrlWithDots,
			},
			expected: true,
		},
		{
			description: 'directory bucket',
			input: {
				bucketName: 'bucket--use1-az2--x-s3',
				key,
				presignedUrl: new URL(
					`https://bucket--use1-az2--x-s3.s3.amz.com/${key}?params=params`,
				),
			},
			expected: true,
		},
		{
			description: 'bucket without dots, wrong presigned url',
			input: {
				bucketName: bucket,
				key,
				presignedUrl: presignedUrlWithDots,
			},
			expected: false,
		},
		{
			description: 'bucket with dots, wrong presigned url',
			input: {
				bucketName: bucketWithDots,
				key,
				presignedUrl,
			},
			expected: false,
		},
		{
			description: 'bucket and key equal',
			input: {
				bucketName: bucket,
				key: bucket,
				presignedUrl: new URL('https://bucket.s3.amz.com/bucket?params=params'),
			},
			expected: true,
		},
		{
			description: 'bucket repeated in url',
			input: {
				bucketName: bucket,
				key,
				presignedUrl: new URL(
					`https://bucketbucket.s3.amz.com/${key}?params=params`,
				),
			},
			expected: false,
		},
		{
			description: 'bucket uppercase and presigned lowercase',
			input: {
				bucketName: 'BUCKET',
				key,
				presignedUrl: new URL(`https://bucket.s3.amz.com/${key}?params=params`),
			},
			expected: false,
		},
		{
			description: 'bucket with dots uppercase and presigned lowercase',
			input: {
				bucketName: 'B.U.C.K.E.T',
				key,
				presignedUrl: new URL(
					`https://s3.amz.com/b.u.c.k.e.t/${key}?params=params`,
				),
			},
			expected: false,
		},
		{
			description: 'key uppercase and presigned lowercase',
			input: {
				bucketName: bucket,
				key: 'KEY',
				presignedUrl: new URL('https://bucket.s3.amz.com/bucket?params=params'),
			},
			expected: false,
		},
		{
			description: 'key lowercase and presigned uppercase',
			input: {
				bucketName: bucket,
				key: 'key',
				presignedUrl: new URL(
					`https://bucket.s3.amz.com/${key.toUpperCase()}?params=params`,
				),
			},
			expected: false,
		},
		{
			description: 'missing bucket',
			input: { key, presignedUrl },
			expected: false,
		},
		{
			description: 'missing key',
			input: { bucketName: bucket, presignedUrl },
			expected: false,
		},
		{
			description: 'missing presignedUrl',
			input: { bucketName: bucket, key },
			expected: false,
		},
	].forEach(({ description, input, expected }) => {
		it(description, () => {
			expect(
				isPresignedURLDurable(input.bucketName, input.key, input.presignedUrl),
			).toEqual(expected);
		});
	});
});
