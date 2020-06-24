import { NamespaceResolver } from '../types';
import { modelNamespaceMap } from './modelNamespaceMap';

export const namespaceResolver: NamespaceResolver = modelConstructor =>
	modelNamespaceMap.get(modelConstructor);
