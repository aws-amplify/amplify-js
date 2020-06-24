import { PersistentModel, PersistentModelConstructor } from '../types';
import { isModelConstructor } from '../util';
import { modelNamespaceMap } from './modelNamespaceMap';

export const isValidModelConstructor = <T extends PersistentModel>(
	obj: any
): obj is PersistentModelConstructor<T> => {
	return isModelConstructor(obj) && modelNamespaceMap.has(obj);
};
