import { documentExists, packageExists, windowExists } from './helpers';

export function reactWebDetect() {
	const reactDevTools = () =>
		windowExists() && window['__REACT_DEVTOOLS_GLOBAL_HOOK__'];
	const reactRootElement = () =>
		documentExists() && document.getElementById('react-root');
	return reactDevTools() || reactRootElement();
}

export function reactSSRDetect() {
	return packageExists('react');
}
