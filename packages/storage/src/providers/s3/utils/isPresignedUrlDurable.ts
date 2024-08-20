import { extendedEncodeURIComponent } from '@aws-amplify/core/internals/aws-client-utils';

export function isPresignedURLDurable(
	bucketName?: string,
	key?: string,
	presignedUrl?: URL,
): boolean {
	if (!bucketName || !key || !presignedUrl) {
		return false;
	}
	const bucketWithDots = bucketName.includes('.');
	const encodedBucketName = extendedEncodeURIComponent(bucketName);
	const encodedKey = key
		.split('/')
		.map(prefix => extendedEncodeURIComponent(prefix))
		.join('/');
	if (bucketWithDots) {
		return presignedUrl.pathname === `/${encodedBucketName}/${encodedKey}`;
	} else {
		return (
			presignedUrl.hostname.startsWith(`${encodedBucketName}.`) &&
			presignedUrl.pathname === `/${encodedKey}`
		);
	}
}
