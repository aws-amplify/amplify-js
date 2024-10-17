import { validateObjectUrl } from '../../../../src/providers/s3/utils/validateObjectUrl';

describe('validateObjectUrl', () => {
	const bucket = 'bucket';
	const key = 'key/eresa/rre';
	const bucketWithDots = 'bucket.with.dots';
	const objectContainingUrl = new URL(
		`https://bucket.s3.amz.com/${key}?params=params`,
	);
	const objectContainingUrlPathStyle = new URL(
		`https://s3.amz.com/bucket/${key}?params=params`,
	);
	const objectContainingUrlWithDots = new URL(
		`https://s3.amz.com/bucket.with.dots/${key}?params=params`,
	);

	test.each([
		{
			description: 'bucket without dots',
			input: {
				bucketName: bucket,
				key,
				objectContainingUrl,
			},
			success: true,
		},
		{
			description: 'bucket without dots path style url',
			input: {
				bucketName: bucket,
				key,
				objectContainingUrl: objectContainingUrlPathStyle,
			},
			success: true,
		},
		{
			description: 'bucket with dots',
			input: {
				bucketName: bucketWithDots,
				key,
				objectContainingUrl: objectContainingUrlWithDots,
			},
			success: true,
		},
		{
			description: 'directory bucket',
			input: {
				bucketName: 'bucket--use1-az2--x-s3',
				key,
				objectContainingUrl: new URL(
					`https://bucket--use1-az2--x-s3.s3.amz.com/${key}?params=params`,
				),
			},
			success: true,
		},
		{
			description: 'bucket without dots, wrong presigned url',
			input: {
				bucketName: bucket,
				key,
				objectContainingUrl: objectContainingUrlWithDots,
			},
			success: false,
		},
		{
			description: 'bucket with dots, wrong presigned url',
			input: {
				bucketName: bucketWithDots,
				key,
				objectContainingUrl,
			},
			success: false,
		},
		{
			description: 'bucket and key equal',
			input: {
				bucketName: bucket,
				key: bucket,
				objectContainingUrl: new URL(
					'https://bucket.s3.amz.com/bucket?params=params',
				),
			},
			success: true,
		},
		{
			description: 'bucket repeated in url',
			input: {
				bucketName: bucket,
				key,
				objectContainingUrl: new URL(
					`https://bucketbucket.s3.amz.com/${key}?params=params`,
				),
			},
			success: false,
		},
		{
			description: 'bucket uppercase and presigned lowercase',
			input: {
				bucketName: 'BUCKET',
				key,
				objectContainingUrl: new URL(
					`https://bucket.s3.amz.com/${key}?params=params`,
				),
			},
			success: false,
		},
		{
			description: 'bucket with dots uppercase and presigned lowercase',
			input: {
				bucketName: 'B.U.C.K.E.T',
				key,
				objectContainingUrl: new URL(
					`https://s3.amz.com/b.u.c.k.e.t/${key}?params=params`,
				),
			},
			success: false,
		},
		{
			description: 'key uppercase and presigned lowercase',
			input: {
				bucketName: bucket,
				key: 'KEY',
				objectContainingUrl: new URL(
					'https://bucket.s3.amz.com/bucket?params=params',
				),
			},
			success: false,
		},
		{
			description: 'key lowercase and presigned uppercase',
			input: {
				bucketName: bucket,
				key: 'key',
				objectContainingUrl: new URL(
					`https://bucket.s3.amz.com/${key.toUpperCase()}?params=params`,
				),
			},
			success: false,
		},
		{
			description: 'missing bucket',
			input: { key, objectContainingUrl },
			success: false,
		},
		{
			description: 'missing key',
			input: { bucketName: bucket, objectContainingUrl },
			success: false,
		},
		{
			description: 'missing objectContainingUrl',
			input: { bucketName: bucket, key, objectContainingUrl: undefined },
			success: false,
		},
	])(`$description`, ({ input, success }) => {
		if (success) {
			expect(() => {
				validateObjectUrl({
					bucketName: input.bucketName,
					key: input.key,
					objectURL: input.objectContainingUrl,
				});
			}).not.toThrow();
		} else {
			expect(() => {
				validateObjectUrl({
					bucketName: input.bucketName,
					key: input.key,
					objectURL: input.objectContainingUrl,
				});
			}).toThrow('An unknown error has occurred.');
		}
	});
});
