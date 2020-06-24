import { PersistentModelConstructor } from '../types';

export const modelNamespaceMap = new WeakMap<
	PersistentModelConstructor<any>,
	string
>();
