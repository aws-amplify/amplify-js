import { Framework } from './types';

interface ExtendedWindow extends Window {
	__REACT_DEVTOOLS_GLOBAL_HOOK__?: any;
}

export const detectFramework = (): Framework => Framework.None;
