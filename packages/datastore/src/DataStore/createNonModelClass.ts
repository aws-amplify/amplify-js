import { Draft, immerable, produce } from 'immer';
import {
	ModelInit,
	ModelInstanceMetadata,
	NonModelTypeConstructor,
	SchemaNonModel,
} from '../types';
import { initializeInstance } from './initializeInstance';

export const createNonModelClass = <T>(typeDefinition: SchemaNonModel) => {
	const clazz = <NonModelTypeConstructor<T>>(<unknown>class Model {
		constructor(init: ModelInit<T>) {
			const instance = produce(
				this,
				(draft: Draft<T & ModelInstanceMetadata>) => {
					initializeInstance(init, typeDefinition, draft);
				}
			);

			return instance;
		}
	});

	clazz[immerable] = true;

	Object.defineProperty(clazz, 'name', { value: typeDefinition.name });

	return clazz;
};
