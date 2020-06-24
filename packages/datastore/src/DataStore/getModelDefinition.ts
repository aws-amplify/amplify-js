import { PersistentModelConstructor } from '../types';
import { modelNamespaceMap } from './modelNamespaceMap';
import { schema } from './schema';

export const getModelDefinition = (
	modelConstructor: PersistentModelConstructor<any>
) => {
	const namespace = modelNamespaceMap.get(modelConstructor);

	return schema.namespaces[namespace].models[modelConstructor.name];
};
