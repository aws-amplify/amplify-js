import { Framework } from '../constants';

export const detectFramework = () => {
	if (document.querySelector('script[id=__NEXT_DATA__]')) {
		return Framework.Next;
	}

	if (
		Array.from(document.querySelectorAll('*')).some(e =>
			e.hasOwnProperty('_reactRootContainer')
		)
	) {
		return Framework.React;
	}

	if (
		window.hasOwnProperty('angular') ||
		!!document.querySelector(
			'.ng-binding, [ng-app], [data-ng-app], [ng-controller], [data-ng-controller], [ng-repeat], [data-ng-repeat]'
		) ||
		!!document.querySelector(
			'script[src*="angular.js"], script[src*="angular.min.js"]'
		)
	) {
		return Framework.Angular;
	}

	if (window.hasOwnProperty('getAllAngularRootElements') || windowHasNgZone()) {
		return Framework.Angular2Plus;
	}

	if (window.hasOwnProperty('Vue')) {
		return Framework.Vue;
	}

	return Framework.JS;
};

const windowHasNgZone = () => {
	return (
		window.hasOwnProperty('ng') &&
		window['ng'].hasOwnProperty('coreTokens') &&
		window['ng']['coreTokens'].hasOwnProperty('NgZone')
	);
};
