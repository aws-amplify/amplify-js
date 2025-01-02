import { nativeModule } from '../nativeModule';
import { RTNCore } from '../types';

export const getPasskey: RTNCore['getPasskey'] = nativeModule.getPasskey;
