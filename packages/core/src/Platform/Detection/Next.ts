export function nextWebDetect() {
	return (
		window && window['__NEXT_DATA__'] && window['__NEXT_DATA__']['buildId']
	);
}

export function nextSSRDetect() {
	// TODO add detection implementation
	return false;
}
