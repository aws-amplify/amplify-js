import { globalExists } from './helpers';

export function expoDetect() {
	return globalExists() && global['expo'] !== undefined;
}
