export function reactWebDetect() {
	const reactDevTools = () =>
		typeof window !== 'undefined' && window['__REACT_DEVTOOLS_GLOBAL_HOOK__'];
	const reactRootElement = () => document.getElementById('react-root');
	return reactDevTools() || reactRootElement();
}
export function reactSSRDetect() {
	// TODO add detection implementation
	return false;
}
