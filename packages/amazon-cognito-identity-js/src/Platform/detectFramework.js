import { Framework } from '../constants';

export const detectFramework = () => {
	if (
		Array.from(document.querySelectorAll('*')).some(e =>
			e.hasOwnProperty('_reactRootContainer')
		)
	) {
		return Framework.React;
	}

	return Framework.None;
};
