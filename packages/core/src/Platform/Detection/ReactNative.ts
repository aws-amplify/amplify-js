export function reactNativeDetect() {
	return (
		typeof navigator !== 'undefined' && navigator.product === 'ReactNative'
	);
}
