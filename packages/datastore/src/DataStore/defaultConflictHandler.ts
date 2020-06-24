import { PersistentModel, SyncConflict } from '../types';
import { modelInstanceCreator } from './modelInstanceCreator';

export function defaultConflictHandler(
	conflictData: SyncConflict
): PersistentModel {
	const { localModel, modelConstructor, remoteModel } = conflictData;
	const { _version } = remoteModel;
	return modelInstanceCreator(modelConstructor, { ...localModel, _version });
}
