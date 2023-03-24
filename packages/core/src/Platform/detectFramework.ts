import { Framework } from './types';

export const detectFramework = (): Framework => {
	if (
		Array.from(document.querySelectorAll('*')).some(e =>
			e.hasOwnProperty('_reactRootContainer')
		)
	) {
		return Framework.React;
	}

	return Framework.None;
};
