import { globalExists } from './helpers';

export function expoDetect() {
	return globalExists() && typeof global['expo'] !== 'undefined';
}
