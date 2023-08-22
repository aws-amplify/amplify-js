export function getUrlDurationInSeconds(
	awsCredExpiration: Date,
	urlExpiration: number
): number {
	if (awsCredExpiration)
		urlExpiration =
			awsCredExpiration.getTime() / 1000 < urlExpiration
				? urlExpiration
				: awsCredExpiration.getTime() / 1000;
	return urlExpiration;
}
