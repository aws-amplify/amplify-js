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
