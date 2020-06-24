import {
	ModelInit,
	ModelInstanceMetadata,
	PersistentModel,
	PersistentModelConstructor,
} from '../types';
import { instancesMetadata } from './instancesMetadata';

export function modelInstanceCreator<
	T extends PersistentModel = PersistentModel
>(
	modelConstructor: PersistentModelConstructor<T>,
	init: ModelInit<T> & Partial<ModelInstanceMetadata>
): T {
	instancesMetadata.add(init);

	return <T>new modelConstructor(init);
}
