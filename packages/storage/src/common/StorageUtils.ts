import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

export const listSingleFile = async ({
	s3Client,
	key,
	bucket,
}: {
	s3Client: S3Client;
	key: string;
	bucket: string;
}) => {
	const listObjectRes = await s3Client.send(
		new ListObjectsV2Command({
			Bucket: bucket,
			Prefix: key,
		})
	);
	const { Contents = [] } = listObjectRes;
	const obj = Contents.find(o => o.Key === key);
	return obj;
};

export const byteLength = (x: unknown) => {
	if (typeof x === 'string') {
		return x.length;
	} else if (isArrayBuffer(x)) {
		return x.byteLength;
	} else if (isBlob(x)) {
		return x.size;
	} else {
		throw new Error(`Cannot determine byte length of ${x}`);
	}
};

const isBlob = (x: unknown): x is Blob => {
	return typeof x !== 'undefined' && x instanceof Blob;
};

const isArrayBuffer = (x: unknown): x is ArrayBuffer => {
	return typeof x !== 'undefined' && x instanceof ArrayBuffer;
};
