import { Draft, immerable, produce } from 'immer';
import { v4 as uuid4 } from 'uuid';
import {
	ModelInit,
	ModelInstanceMetadata,
	MutableModel,
	PersistentModel,
	PersistentModelConstructor,
	SchemaModel,
} from '../types';
import { monotonicUlidFactory } from '../util';
import { initializeInstance } from './initializeInstance';
import { instancesMetadata } from './instancesMetadata';
import { isValidModelConstructor } from './isValidModelConstructor';
import { logger } from './logger';
import { modelInstanceCreator } from './modelInstanceCreator';

const ulid = monotonicUlidFactory(Date.now());

export const createModelClass = <T extends PersistentModel>(
	modelDefinition: SchemaModel
) => {
	const clazz = <PersistentModelConstructor<T>>(<unknown>class Model {
		constructor(init: ModelInit<T>) {
			const instance = produce(
				this,
				(draft: Draft<T & ModelInstanceMetadata>) => {
					initializeInstance(init, modelDefinition, draft);

					const modelInstanceMetadata: ModelInstanceMetadata = instancesMetadata.has(
						init
					)
						? <ModelInstanceMetadata>(<unknown>init)
						: <ModelInstanceMetadata>{};
					const {
						id: _id,
						_version,
						_lastChangedAt,
						_deleted,
					} = modelInstanceMetadata;

					const id =
						// instancesIds is set by modelInstanceCreator, it is accessible only internally
						_id !== null && _id !== undefined
							? _id
							: modelDefinition.syncable
							? uuid4()
							: ulid();

					draft.id = id;

					if (modelDefinition.syncable) {
						draft._version = _version;
						draft._lastChangedAt = _lastChangedAt;
						draft._deleted = _deleted;
					}
				}
			);

			return instance;
		}

		static copyOf(source: T, fn: (draft: MutableModel<T>) => T) {
			const modelConstructor = Object.getPrototypeOf(source || {}).constructor;

			if (!isValidModelConstructor(modelConstructor)) {
				const msg = 'The source object is not a valid model';
				logger.error(msg, { source });

				throw new Error(msg);
			}

			return produce(source, draft => {
				fn(<MutableModel<T>>draft);
				draft.id = source.id;
			});
		}

		static fromJSON(json: T | T[]) {
			if (Array.isArray(json)) {
				return json.map(init => this.fromJSON(init));
			}

			return modelInstanceCreator(clazz, json);
		}
	});

	clazz[immerable] = true;

	Object.defineProperty(clazz, 'name', { value: modelDefinition.name });

	return clazz;
};
