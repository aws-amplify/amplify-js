export function reactNativeDetect() {
	return (
		typeof navigator !== 'undefined' &&
		typeof navigator.product !== 'undefined' &&
		navigator.product === 'ReactNative'
	);
}
