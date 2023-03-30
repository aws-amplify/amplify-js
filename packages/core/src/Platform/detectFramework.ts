import { Framework } from './types';

interface ExtendedWindow extends Window {
	__REACT_DEVTOOLS_GLOBAL_HOOK__?: any;
}

export const detectFramework = (isReactNative: Boolean): Framework => {
	if (isReactNative) {
		return Framework.ReactNative;
	}

	if (typeof document == 'undefined') {
		return Framework.NodeJS;
	}

	const reactWindow = window as ExtendedWindow;

	if (
		reactWindow.__REACT_DEVTOOLS_GLOBAL_HOOK__ &&
		reactWindow.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers.size > 0
	) {
		return Framework.React;
	}

	return Framework.None;
};
