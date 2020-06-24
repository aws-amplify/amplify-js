import { NonModelTypeConstructor, PersistentModelConstructor } from '../types';
import {
	DATASTORE,
	exhaustiveCheck,
	NAMESPACES,
	STORAGE,
	SYNC,
	USER,
} from '../util';
import { isValidModelConstructor } from './isValidModelConstructor';
import { logger } from './logger';
import {
	dataStoreClasses,
	storageClasses,
	syncClasses,
	userClasses,
} from './schema';

export function getModelConstructorByModelName(
	namespaceName: NAMESPACES,
	modelName: string
): PersistentModelConstructor<any> {
	let result: PersistentModelConstructor<any> | NonModelTypeConstructor<any>;

	switch (namespaceName) {
		case DATASTORE:
			result = dataStoreClasses[modelName];
			break;
		case USER:
			result = userClasses[modelName];
			break;
		case SYNC:
			result = syncClasses[modelName];
			break;
		case STORAGE:
			result = storageClasses[modelName];
			break;
		default:
			exhaustiveCheck(namespaceName);
			break;
	}

	if (isValidModelConstructor(result)) {
		return result;
	} else {
		const msg = `Model name is not valid for namespace. modelName: ${modelName}, namespace: ${namespaceName}`;
		logger.error(msg);

		throw new Error(msg);
	}
}
