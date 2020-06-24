import { ModelInit, ModelInstanceMetadata, PersistentModel } from '../types';

export const instancesMetadata = new WeakSet<
	ModelInit<PersistentModel & Partial<ModelInstanceMetadata>>
>();
