import { nativeModule } from '../nativeModule';
import { RTNCore } from '../types';

export const createPasskey: RTNCore['createPasskey'] =
	nativeModule.createPasskey;
