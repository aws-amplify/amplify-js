import API from '@aws-amplify/api';
import { Auth } from '@aws-amplify/auth';
import Cache from '@aws-amplify/cache';
import {
	Amplify,
	ConsoleLogger as Logger,
	Hub,
	JS,
	BackgroundProcessManager,
} from '@aws-amplify/core';
import {
	Draft,
	immerable,
	produce,
	setAutoFreeze,
	enablePatches,
	Patch,
} from 'immer';
import { v4 as uuid4 } from 'uuid';
import Observable, { ZenObservable } from 'zen-observable-ts';
import { defaultAuthStrategy, multiAuthStrategy } from '../authModeStrategies';
import {
	isPredicatesAll,
	ModelPredicateCreator,
	ModelSortPredicateCreator,
	PredicateAll,
} from '../predicates';
import { Adapter } from '../storage/adapter';
import { ExclusiveStorage as Storage } from '../storage/storage';
import { ModelRelationship } from '../storage/relationship';
import { ControlMessage, SyncEngine } from '../sync';
import {
	AuthModeStrategy,
	ConflictHandler,
	DataStoreConfig,
	GraphQLScalarType,
	InternalSchema,
	isGraphQLScalarType,
	isSchemaModelWithAttributes,
	ModelFieldType,
	ModelInit,
	ModelInstanceMetadata,
	ModelPredicate,
	ModelField,
	SortPredicate,
	MutableModel,
	NamespaceResolver,
	NonModelTypeConstructor,
	ProducerPaginationInput,
	PaginationInput,
	PersistentModel,
	PersistentModelConstructor,
	ProducerModelPredicate,
	Schema,
	SchemaModel,
	SchemaNamespace,
	SchemaNonModel,
	SubscriptionMessage,
	DataStoreSnapshot,
	SyncConflict,
	SyncError,
	TypeConstructorMap,
	ErrorHandler,
	SyncExpression,
	AuthModeStrategyType,
	isNonModelFieldType,
	isModelFieldType,
	ObserveQueryOptions,
	ManagedIdentifier,
	PersistentModelMetaData,
	IdentifierFieldOrIdentifierObject,
	__modelMeta__,
	isIdentifierObject,
	AmplifyContext,
	isFieldAssociation,
	isModelAttributePrimaryKey,
	ModelMeta,
} from '../types';
import {
	DATASTORE,
	errorMessages,
	establishRelationAndKeys,
	isModelConstructor,
	monotonicUlidFactory,
	NAMESPACES,
	STORAGE,
	SYNC,
	USER,
	isNullOrUndefined,
	registerNonModelClass,
	sortCompareFunction,
	DeferredCallbackResolver,
	inMemoryPagination,
	extractPrimaryKeyFieldNames,
	extractPrimaryKeysAndValues,
	isIdManaged,
	isIdOptionallyManaged,
	validatePredicate,
	mergePatches,
} from '../util';
import {
	RecursiveModelPredicateExtender,
	ModelPredicateExtender,
	recursivePredicateFor,
	predicateFor,
	GroupCondition,
} from '../predicates/next';
import { getIdentifierValue } from '../sync/utils';

setAutoFreeze(true);
enablePatches();

const logger = new Logger('DataStore');

const ulid = monotonicUlidFactory(Date.now());
const { isNode } = JS.browserOrNode();

type SettingMetaData = {
	identifier: ManagedIdentifier<Setting, 'id'>;
	readOnlyFields: never;
};
declare class Setting {
	public readonly [__modelMeta__]: SettingMetaData;
	constructor(init: ModelInit<Setting, SettingMetaData>);
	static copyOf(
		src: Setting,
		mutator: (draft: MutableModel<Setting, SettingMetaData>) => void | Setting
	): Setting;
	public readonly id: string;
	public readonly key: string;
	public readonly value: string;
}

const SETTING_SCHEMA_VERSION = 'schemaVersion';

let schema: InternalSchema;
const modelNamespaceMap = new WeakMap<
	PersistentModelConstructor<any>,
	string
>();
// stores data for crafting the correct update mutation input for a model
// Patch[] - array of changed fields and metadata
// PersistentModel - the source model, used for diffing object-type fields
const modelPatchesMap = new WeakMap<
	PersistentModel,
	[Patch[], PersistentModel]
>();

const getModelDefinition = (
	modelConstructor: PersistentModelConstructor<any>
) => {
	const namespace = modelNamespaceMap.get(modelConstructor);
	return namespace
		? schema.namespaces[namespace].models[modelConstructor.name]
		: undefined;
};

const getModelPKFieldName = (
	modelConstructor: PersistentModelConstructor<any>
) => {
	const namespace = modelNamespaceMap.get(modelConstructor);
	return (
		(namespace &&
			schema.namespaces?.[namespace]?.keys?.[modelConstructor.name]
				.primaryKey) || ['id']
	);
};

const isValidModelConstructor = <T extends PersistentModel>(
	obj: any
): obj is PersistentModelConstructor<T> => {
	if (isModelConstructor(obj) && modelNamespaceMap.has(obj)) {
		return true;
	} else {
		console.error('isValidModelConstructor', {
			obj,
			isModelConstructor: isModelConstructor(obj),
			'modelNamespaceMap.has': modelNamespaceMap.has(obj),
		});
		return false;
	}
};

const namespaceResolver: NamespaceResolver = modelConstructor => {
	const resolver = modelNamespaceMap.get(modelConstructor);
	if (!resolver) {
		throw new Error(
			`Namespace Resolver for '${modelConstructor.name}' not found! This is probably a bug in '@amplify-js/datastore'.`
		);
	}
	return resolver;
};

const buildSeedPredicate = <T extends PersistentModel>(
	modelConstructor: PersistentModelConstructor<T>
) => {
	if (!modelConstructor) throw new Error('Missing modelConstructor');

	const modelSchema = getModelDefinition(
		modelConstructor as PersistentModelConstructor<T>
	);
	if (!modelSchema) throw new Error('Missing modelSchema');

	const pks = getModelPKFieldName(
		modelConstructor as PersistentModelConstructor<T>
	);
	if (!pks) throw new Error('Could not determine PK');

	return recursivePredicateFor<T>({
		builder: modelConstructor as PersistentModelConstructor<T>,
		schema: modelSchema,
		pkField: pks,
	});
};

// exporting syncClasses for testing outbox.test.ts
export let syncClasses: TypeConstructorMap;
let userClasses: TypeConstructorMap;
let dataStoreClasses: TypeConstructorMap;
let storageClasses: TypeConstructorMap;

const modelInstanceAssociationsMap = new WeakMap<PersistentModel, object>();

const initSchema = (userSchema: Schema) => {
	if (schema !== undefined) {
		console.warn('The schema has already been initialized');

		return userClasses;
	}

	logger.log('validating schema', { schema: userSchema });

	const internalUserNamespace: SchemaNamespace = {
		name: USER,
		...userSchema,
	};

	logger.log('DataStore', 'Init models');
	userClasses = createTypeClasses(internalUserNamespace);
	logger.log('DataStore', 'Models initialized');

	const dataStoreNamespace = getNamespace();
	const storageNamespace = Storage.getNamespace();
	const syncNamespace = SyncEngine.getNamespace();

	dataStoreClasses = createTypeClasses(dataStoreNamespace);
	storageClasses = createTypeClasses(storageNamespace);
	syncClasses = createTypeClasses(syncNamespace);

	schema = {
		namespaces: {
			[dataStoreNamespace.name]: dataStoreNamespace,
			[internalUserNamespace.name]: internalUserNamespace,
			[storageNamespace.name]: storageNamespace,
			[syncNamespace.name]: syncNamespace,
		},
		version: userSchema.version,
	};

	Object.keys(schema.namespaces).forEach(namespace => {
		const [relations, keys] = establishRelationAndKeys(
			schema.namespaces[namespace]
		);

		schema.namespaces[namespace].relationships = relations;
		schema.namespaces[namespace].keys = keys;

		const modelAssociations = new Map<string, string[]>();

		Object.values(schema.namespaces[namespace].models).forEach(model => {
			const connectedModels: string[] = [];

			Object.values(model.fields)
				.filter(
					field =>
						field.association &&
						field.association.connectionType === 'BELONGS_TO' &&
						(<ModelFieldType>field.type).model !== model.name
				)
				.forEach(field =>
					connectedModels.push((<ModelFieldType>field.type).model)
				);

			modelAssociations.set(model.name, connectedModels);

			Object.values(model.fields).forEach(field => {
				if (
					typeof field.type === 'object' &&
					!Object.getOwnPropertyDescriptor(
						<ModelFieldType>field.type,
						'modelConstructor'
					)
				) {
					Object.defineProperty(field.type, 'modelConstructor', {
						get: () => {
							return {
								builder: userClasses[(<ModelFieldType>field.type).model],
								schema:
									schema.namespaces[namespace].models[
										(<ModelFieldType>field.type).model
									],
								pkField: getModelPKFieldName(
									userClasses[
										(<ModelFieldType>field.type).model
									] as PersistentModelConstructor<any>
								),
							};
						},
					});
				}
			});
		});

		const result = new Map<string, string[]>();

		let count = 1000;
		while (true && count > 0) {
			if (modelAssociations.size === 0) {
				break;
			}
			count--;
			if (count === 0) {
				throw new Error(
					'Models are not topologically sortable. Please verify your schema.'
				);
			}

			for (const modelName of Array.from(modelAssociations.keys())) {
				const parents = modelAssociations.get(modelName);

				if (parents?.every(x => result.has(x))) {
					result.set(modelName, parents);
				}
			}

			Array.from(result.keys()).forEach(x => modelAssociations.delete(x));
		}

		schema.namespaces[namespace].modelTopologicalOrdering = result;
	});

	return userClasses;
};

/**
 * Throws an exception if the schema has *not* been initialized
 * by `initSchema()`.
 *
 * **To be called before trying to access schema.**
 *
 * Currently this only needs to be called in `start()` and `clear()` because
 * all other functions will call start first.
 */
const checkSchemaInitialized = () => {
	if (schema === undefined) {
		const message =
			'Schema is not initialized. DataStore will not function as expected. This could happen if you have multiple versions of DataStore installed. Please see https://docs.amplify.aws/lib/troubleshooting/upgrading/q/platform/js/#check-for-duplicate-versions';
		logger.error(message);
		throw new Error(message);
	}
};

const createTypeClasses: (
	namespace: SchemaNamespace
) => TypeConstructorMap = namespace => {
	const classes: TypeConstructorMap = {};

	Object.entries(namespace.models).forEach(([modelName, modelDefinition]) => {
		const clazz = createModelClass(modelDefinition);
		classes[modelName] = clazz;

		modelNamespaceMap.set(clazz, namespace.name);
	});

	Object.entries(namespace.nonModels || {}).forEach(
		([typeName, typeDefinition]) => {
			const clazz = createNonModelClass(typeDefinition) as any;
			classes[typeName] = clazz;
		}
	);

	return classes;
};

/**
 * Constructs a model and records it with its metadata in a weakset. Allows for
 * the separate storage of core model fields and Amplify/DataStore metadata
 * fields that the customer app does not want exposed.
 *
 * @param modelConstructor The model constructor.
 * @param init Init data that would normally be passed to the constructor.
 * @returns The initialized model.
 */
export declare type ModelInstanceCreator = typeof modelInstanceCreator;

/**
 * Collection of instantiated models to allow storage of metadata apart from
 * the model visible to the consuming app -- in case the app doesn't have
 * metadata fields (_version, _deleted, etc.) exposed on the model itself.
 */
const instancesMetadata = new WeakSet<ModelInit<any, any>>();

function modelInstanceCreator<T extends PersistentModel>(
	modelConstructor: PersistentModelConstructor<T>,
	init: Partial<T>
): T {
	instancesMetadata.add(init);

	return new modelConstructor(<ModelInit<T, PersistentModelMetaData<T>>>init);
}

const validateModelFields =
	(modelDefinition: SchemaModel | SchemaNonModel) => (k: string, v: any) => {
		const fieldDefinition = modelDefinition.fields[k];

		if (fieldDefinition !== undefined) {
			const { type, isRequired, isArrayNullable, name, isArray } =
				fieldDefinition;

			if (
				((!isArray && isRequired) || (isArray && !isArrayNullable)) &&
				(v === null || v === undefined)
			) {
				throw new Error(`Field ${name} is required`);
			}

			if (
				isSchemaModelWithAttributes(modelDefinition) &&
				!isIdManaged(modelDefinition)
			) {
				const keys = extractPrimaryKeyFieldNames(modelDefinition);
				if (keys.includes(k) && v === '') {
					logger.error(errorMessages.idEmptyString, { k, value: v });
					throw new Error(errorMessages.idEmptyString);
				}
			}

			if (isGraphQLScalarType(type)) {
				const jsType = GraphQLScalarType.getJSType(type);
				const validateScalar = GraphQLScalarType.getValidationFunction(type);

				if (type === 'AWSJSON') {
					if (typeof v === jsType) {
						return;
					}
					if (typeof v === 'string') {
						try {
							JSON.parse(v);
							return;
						} catch (error) {
							throw new Error(`Field ${name} is an invalid JSON object. ${v}`);
						}
					}
				}

				if (isArray) {
					let errorTypeText: string = jsType;
					if (!isRequired) {
						errorTypeText = `${jsType} | null | undefined`;
					}

					if (!Array.isArray(v) && !isArrayNullable) {
						throw new Error(
							`Field ${name} should be of type [${errorTypeText}], ${typeof v} received. ${v}`
						);
					}

					if (
						!isNullOrUndefined(v) &&
						(<[]>v).some(e =>
							isNullOrUndefined(e) ? isRequired : typeof e !== jsType
						)
					) {
						const elemTypes = (<[]>v)
							.map(e => (e === null ? 'null' : typeof e))
							.join(',');

						throw new Error(
							`All elements in the ${name} array should be of type ${errorTypeText}, [${elemTypes}] received. ${v}`
						);
					}

					if (validateScalar && !isNullOrUndefined(v)) {
						const validationStatus = (<[]>v).map(e => {
							if (!isNullOrUndefined(e)) {
								return validateScalar(e);
							} else if (isNullOrUndefined(e) && !isRequired) {
								return true;
							} else {
								return false;
							}
						});

						if (!validationStatus.every(s => s)) {
							throw new Error(
								`All elements in the ${name} array should be of type ${type}, validation failed for one or more elements. ${v}`
							);
						}
					}
				} else if (!isRequired && v === undefined) {
					return;
				} else if (typeof v !== jsType && v !== null) {
					throw new Error(
						`Field ${name} should be of type ${jsType}, ${typeof v} received. ${v}`
					);
				} else if (
					!isNullOrUndefined(v) &&
					validateScalar &&
					!validateScalar(v as never) // TODO: why never, TS ... why ...
				) {
					throw new Error(
						`Field ${name} should be of type ${type}, validation failed. ${v}`
					);
				}
			}
		}
	};

const castInstanceType = (
	modelDefinition: SchemaModel | SchemaNonModel,
	k: string,
	v: any
) => {
	const { isArray, type } = modelDefinition.fields[k] || {};
	// attempt to parse stringified JSON
	if (
		typeof v === 'string' &&
		(isArray ||
			type === 'AWSJSON' ||
			isNonModelFieldType(type) ||
			isModelFieldType(type))
	) {
		try {
			return JSON.parse(v);
		} catch {
			// if JSON is invalid, don't throw and let modelValidator handle it
		}
	}

	// cast from numeric representation of boolean to JS boolean
	if (typeof v === 'number' && type === 'Boolean') {
		return Boolean(v);
	}

	return v;
};

const initializeInstance = <T extends PersistentModel>(
	init: ModelInit<T>,
	modelDefinition: SchemaModel | SchemaNonModel,
	draft: Draft<T & ModelInstanceMetadata>
) => {
	const modelValidator = validateModelFields(modelDefinition);
	Object.entries(init).forEach(([k, v]) => {
		const parsedValue = castInstanceType(modelDefinition, k, v);

		modelValidator(k, parsedValue);
		(<any>draft)[k] = parsedValue;
	});
};

const createModelClass = <T extends PersistentModel>(
	modelDefinition: SchemaModel
) => {
	const clazz = <PersistentModelConstructor<T>>(<unknown>class Model {
		constructor(init: ModelInit<T>) {
			const instance = produce(
				this,
				(draft: Draft<T & ModelInstanceMetadata>) => {
					initializeInstance(init, modelDefinition, draft);

					// model is initialized inside a DataStore component (e.g. by Sync Engine, Storage Engine, etc.)
					const isInternallyInitialized = instancesMetadata.has(init);

					const modelInstanceMetadata: ModelInstanceMetadata =
						isInternallyInitialized
							? <ModelInstanceMetadata>(<unknown>init)
							: <ModelInstanceMetadata>{};

					type ModelWithIDIdentifier = { id: string };

					const { id: _id } =
						modelInstanceMetadata as unknown as ModelWithIDIdentifier;

					if (isIdManaged(modelDefinition)) {
						const isInternalModel = _id !== null && _id !== undefined;

						const id = isInternalModel
							? _id
							: modelDefinition.syncable
							? uuid4()
							: ulid();

						(<ModelWithIDIdentifier>(<unknown>draft)).id = id;
					} else if (isIdOptionallyManaged(modelDefinition)) {
						// only auto-populate if the id was not provided
						(<ModelWithIDIdentifier>(<unknown>draft)).id = draft.id || uuid4();
					}

					if (!isInternallyInitialized) {
						checkReadOnlyPropertyOnCreate(draft, modelDefinition);
					}

					const { _version, _lastChangedAt, _deleted } = modelInstanceMetadata;

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

			let patches;
			const model = produce(
				source,
				draft => {
					fn(<MutableModel<T>>draft);

					const keyNames = extractPrimaryKeyFieldNames(modelDefinition);
					// Keys are immutable
					keyNames.forEach(key => ((draft as Object)[key] = source[key]));

					const modelValidator = validateModelFields(modelDefinition);
					Object.entries(draft).forEach(([k, v]) => {
						const parsedValue = castInstanceType(modelDefinition, k, v);

						modelValidator(k, parsedValue);
					});
				},
				p => (patches = p)
			);

			const hasExistingPatches = modelPatchesMap.has(source);

			if (patches.length || hasExistingPatches) {
				if (hasExistingPatches) {
					const [existingPatches, existingSource] =
						modelPatchesMap.get(source)!;
					const mergedPatches = mergePatches(
						existingSource,
						existingPatches,
						patches
					);
					modelPatchesMap.set(model, [mergedPatches, existingSource]);
					checkReadOnlyPropertyOnUpdate(mergedPatches, modelDefinition);
				} else {
					modelPatchesMap.set(model, [patches, source]);
					checkReadOnlyPropertyOnUpdate(patches, modelDefinition);
				}
			}

			return model;
		}

		// "private" method (that's hidden via `Setting`) for `withSSRContext` to use
		// to gain access to `modelInstanceCreator` and `clazz` for persisting IDs from server to client.
		static fromJSON(json: T | T[]) {
			if (Array.isArray(json)) {
				return json.map(init => this.fromJSON(init));
			}

			const instance = modelInstanceCreator(clazz, json);

			const modelValidator = validateModelFields(modelDefinition);

			Object.entries(instance).forEach(([k, v]) => {
				modelValidator(k, v);
			});

			return instance;
		}
	});

	clazz[immerable] = true;

	Object.defineProperty(clazz, 'name', { value: modelDefinition.name });

	for (const field in modelDefinition.fields) {
		if (!isFieldAssociation(modelDefinition, field)) {
			continue;
		}

		const {
			type,
			association: localAssociation,
			association: { targetName, targetNames },
		} = modelDefinition.fields[field] as Required<ModelField>;

		// const relationship = new ModelRelationship(modelDefinition, field);
		const relationship = new ModelRelationship(
			{
				builder: clazz,
				schema: modelDefinition,
				pkField: extractPrimaryKeyFieldNames(modelDefinition),
			},
			field
		);

		Object.defineProperty(clazz.prototype, modelDefinition.fields[field].name, {
			set(model: PersistentModel) {
				// console.log(
				// 	'set',
				// 	field,
				// 	relationship.localJoinFields,
				// 	relationship.remoteJoinFields,
				// 	this,
				// 	model
				// );
				if (!model || !(typeof model === 'object')) return;
				// Avoid validation error when processing AppSync response with nested
				// selection set. Nested entitites lack version field and can not be validated
				// TODO: explore a more reliable method to solve this
				if (model.hasOwnProperty('_version')) {
					const modelConstructor = Object.getPrototypeOf(model || {})
						.constructor as PersistentModelConstructor<T>;

					if (!isValidModelConstructor(modelConstructor)) {
						const msg = `Value passed to ${modelDefinition.name}.${field} is not a valid instance of a model`;
						logger.error(msg, { model });

						throw new Error(msg);
					}

					if (
						modelConstructor.name.toLowerCase() !==
						relationship.remoteModelConstructor.name.toLowerCase()
					) {
						const msg = `Value passed to ${modelDefinition.name}.${field} is not an instance of ${relationship.remoteModelConstructor.name}`;
						logger.error(msg, { model });

						throw new Error(msg);
					}
				}

				// TODO: Consider moving this logic into the relationship.
				if (relationship.isComplete) {
					// assumes targetNames is in same-order as relatedModelPKFields
					for (let i = 0; i < relationship.localJoinFields.length; i++) {
						// console.log(
						// 	`setting ${relationship.localJoinFields[i]} = ${
						// 		relationship.remoteJoinFields[i]
						// 	} (${model[relationship.remoteJoinFields[i]]})`
						// );
						this[relationship.localJoinFields[i]] =
							model[relationship.remoteJoinFields[i]];
					}
				}
			},
			get() {
				// console.log(
				// 	'get',
				// 	field,
				// 	relationship.localJoinFields,
				// 	relationship.remoteJoinFields,
				// 	this
				// );

				const instanceMemos = modelInstanceAssociationsMap.has(this)
					? modelInstanceAssociationsMap.get(this)!
					: modelInstanceAssociationsMap.set(this, {}).get(this)!;

				if (!instanceMemos.hasOwnProperty(field)) {
					// console.log(
					// 	'remote constructor',
					// 	relationship.remoteModelConstructor
					// );
					const resultPromise = instance.query(
						relationship.remoteModelConstructor as PersistentModelConstructor<T>,
						base =>
							base.and(q => {
								// console.log('querying property', relationship);
								return relationship.remoteJoinFields.map((field, index) => {
									// console.log(
									// 	'relating',
									// 	field,
									// 	relationship.localJoinFields[index]
									// );
									return (q[field] as any).eq(
										this[relationship.localJoinFields[index]]
									);
								});
							})
					);

					if (relationship.relationship === 'HAS_MANY') {
						instanceMemos[field] = new AsyncCollection(resultPromise);
					} else {
						instanceMemos[field] = resultPromise.then(rows => {
							if (rows.length > 1) {
								// should never happen for a HAS_ONE or BELONGS_TO.
								const err = new Error(`
									Data integrity error.
									Too many records found for a HAS_ONE/BELONGS_TO field '${modelDefinition.name}.${field}'
								`);
								console.error(err);
								throw err;
							} else {
								return rows[0];
							}
						});
					}
				}

				return instanceMemos[field];
			},
		});
	}

	return clazz;
};

export class AsyncItem<T> extends Promise<T> {}

export class AsyncCollection<T> implements AsyncIterable<T> {
	values: Array<any> | Promise<Array<any>>;

	constructor(values: Array<any> | Promise<Array<any>>) {
		this.values = values;
	}

	[Symbol.asyncIterator](): AsyncIterator<T> {
		let values;
		let index = 0;
		return {
			next: async () => {
				if (!values) values = await this.values;
				if (index < values.length) {
					const result = {
						value: values[index],
						done: false,
					};
					index++;
					return result;
				}
				return {
					value: null,
					done: true,
				};
			},
		};
	}

	async toArray({
		max = Number.MAX_SAFE_INTEGER,
	}: { max?: number } = {}): Promise<T[]> {
		const output: T[] = [];
		let i = 0;
		for await (const element of this) {
			if (i < max) {
				output.push(element);
				i++;
			} else {
				break;
			}
		}
		return output;
	}
}

const checkReadOnlyPropertyOnCreate = <T extends PersistentModel>(
	draft: T,
	modelDefinition: SchemaModel
) => {
	const modelKeys = Object.keys(draft);
	const { fields } = modelDefinition;

	modelKeys.forEach(key => {
		if (fields[key] && fields[key].isReadOnly) {
			throw new Error(`${key} is read-only.`);
		}
	});
};

const checkReadOnlyPropertyOnUpdate = (
	patches: Patch[],
	modelDefinition: SchemaModel
) => {
	const patchArray = patches.map(p => [p.path[0], p.value]);
	const { fields } = modelDefinition;

	patchArray.forEach(([key, val]) => {
		if (!val || !fields[key]) return;

		if (fields[key].isReadOnly) {
			throw new Error(`${key} is read-only.`);
		}
	});
};

const createNonModelClass = <T extends PersistentModel>(
	typeDefinition: SchemaNonModel
) => {
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

	registerNonModelClass(clazz);

	return clazz;
};

function isQueryOne(obj: any): obj is string {
	return typeof obj === 'string';
}

function defaultConflictHandler(conflictData: SyncConflict): PersistentModel {
	const { localModel, modelConstructor, remoteModel } = conflictData;
	const { _version } = remoteModel;
	return modelInstanceCreator(modelConstructor, { ...localModel, _version });
}

function defaultErrorHandler(error: SyncError<PersistentModel>): void {
	logger.warn(error);
}

function getModelConstructorByModelName(
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
			throw new Error(`Invalid namespace: ${namespaceName}`);
	}

	if (isValidModelConstructor(result)) {
		return result;
	} else {
		const msg = `Model name is not valid for namespace. modelName: ${modelName}, namespace: ${namespaceName}`;
		logger.error(msg);

		throw new Error(msg);
	}
}

/**
 * Queries the DataStore metadata tables to see if they are the expected
 * version. If not, clobbers the whole DB. If so, leaves them alone.
 * Otherwise, simply writes the schema version.
 *
 * SIDE EFFECT:
 * 1. Creates a transaction
 * 1. Updates data.
 *
 * @param storage Storage adapter containing the metadata.
 * @param version The expected schema version.
 */
async function checkSchemaVersion(
	storage: Storage,
	version: string
): Promise<void> {
	const Setting =
		dataStoreClasses.Setting as PersistentModelConstructor<Setting>;

	const modelDefinition = schema.namespaces[DATASTORE].models.Setting;

	await storage.runExclusive(async s => {
		const [schemaVersionSetting] = await s.query(
			Setting,
			ModelPredicateCreator.createFromExisting(modelDefinition, c =>
				c.key('eq', SETTING_SCHEMA_VERSION)
			),
			{ page: 0, limit: 1 }
		);

		if (
			schemaVersionSetting !== undefined &&
			schemaVersionSetting.value !== undefined
		) {
			const storedValue = JSON.parse(schemaVersionSetting.value);

			if (storedValue !== version) {
				await s.clear(false);
			}
		} else {
			await s.save(
				modelInstanceCreator(Setting, {
					key: SETTING_SCHEMA_VERSION,
					value: JSON.stringify(version),
				})
			);
		}
	});
}

let syncSubscription: ZenObservable.Subscription;

function getNamespace(): SchemaNamespace {
	const namespace: SchemaNamespace = {
		name: DATASTORE,
		relationships: {},
		enums: {},
		nonModels: {},
		models: {
			Setting: {
				name: 'Setting',
				pluralName: 'Settings',
				syncable: false,
				fields: {
					id: {
						name: 'id',
						type: 'ID',
						isRequired: true,
						isArray: false,
					},
					key: {
						name: 'key',
						type: 'String',
						isRequired: true,
						isArray: false,
					},
					value: {
						name: 'value',
						type: 'String',
						isRequired: true,
						isArray: false,
					},
				},
			},
		},
	};

	return namespace;
}

class DataStore {
	// reference to configured category instances. Used for preserving SSR context
	private Auth = Auth;
	private API = API;
	private Cache = Cache;

	// Non-null assertions (bang operator) have been added to most of these properties
	// to make TS happy. These properties are all expected to be set immediately after
	// construction.
	private amplifyConfig: Record<string, any> = {};
	private authModeStrategy!: AuthModeStrategy;
	private conflictHandler!: ConflictHandler;
	private errorHandler!: (error: SyncError<PersistentModel>) => void;
	private fullSyncInterval!: number;
	private initialized?: Promise<void>;
	private initReject!: Function;
	private initResolve!: Function;
	private maxRecordsToSync!: number;
	private storage?: Storage;
	private sync?: SyncEngine;
	private syncPageSize!: number;
	private syncExpressions!: SyncExpression[];
	private syncPredicates: WeakMap<SchemaModel, ModelPredicate<any>> =
		new WeakMap<SchemaModel, ModelPredicate<any>>();
	private sessionId?: string;
	private storageAdapter!: Adapter;
	// object that gets passed to descendent classes. Allows us to pass these down by reference
	private amplifyContext: AmplifyContext = {
		Auth: this.Auth,
		API: this.API,
		Cache: this.Cache,
	};

	/**
	 * **IMPORTANT!**
	 *
	 * Accumulator for backgrouns things that can **and MUST** be called when
	 * DataStore stops.
	 *
	 * These jobs **MUST** be *idempotent promises* that resolve ONLY
	 * once the intended jobs are completely finished and/or otherwise destroyed
	 * and cleaned up with ZERO outstanding:
	 *
	 * 1. side effects (e.g., state changes)
	 * 1. callbacks
	 * 1. subscriptions
	 * 1. calls to storage
	 * 1. *etc.*
	 *
	 * Methods that create pending promises, subscriptions, callbacks, or any
	 * type of side effect **MUST** be registered with the manager. And, a new
	 * manager must be created after each `exit()`.
	 *
	 * Failure to comply will put DataStore into a highly unpredictable state
	 * when it needs to stop or clear -- which occurs when restarting with new
	 * sync expressions, during testing, and potentially during app code
	 * recovery handling, etc..
	 *
	 * It is up to the discretion of each disposer whether to wait for job
	 * completion or to cancel operations and issue failures *as long as the
	 * disposer returns in a reasonable amount of time.*
	 *
	 * (Reasonable = *seconds*, not minutes.)
	 */
	private runningProcesses = new BackgroundProcessManager();

	getModuleName() {
		return 'DataStore';
	}

	/**
	 * If not already done:
	 * 1. Attaches and initializes storage.
	 * 1. Loads the schema and records metadata.
	 * 1. If `this.amplifyConfig.aws_appsync_graphqlEndpoint` contains a URL,
	 * attaches a sync engine, starts it, and subscribes.
	 */
	start = async (): Promise<void> => {
		return this.runningProcesses.add(async () => {
			if (this.initialized === undefined) {
				logger.debug('Starting DataStore');
				this.initialized = new Promise((res, rej) => {
					this.initResolve = res;
					this.initReject = rej;
				});
			} else {
				await this.initialized;

				return;
			}

			this.storage = new Storage(
				schema,
				namespaceResolver,
				getModelConstructorByModelName,
				modelInstanceCreator,
				this.storageAdapter,
				this.sessionId
			);

			await this.storage.init();

			checkSchemaInitialized();
			await checkSchemaVersion(this.storage, schema.version);

			const { aws_appsync_graphqlEndpoint } = this.amplifyConfig;

			if (aws_appsync_graphqlEndpoint) {
				logger.debug('GraphQL endpoint available', aws_appsync_graphqlEndpoint);

				this.syncPredicates = await this.processSyncExpressions();

				this.sync = new SyncEngine(
					schema,
					namespaceResolver,
					syncClasses,
					userClasses,
					this.storage,
					modelInstanceCreator,
					this.conflictHandler,
					this.errorHandler,
					this.syncPredicates,
					this.amplifyConfig,
					this.authModeStrategy,
					this.amplifyContext
				);

				const fullSyncIntervalInMilliseconds =
					this.fullSyncInterval * 1000 * 60; // fullSyncInterval from param is in minutes
				syncSubscription = this.sync
					.start({ fullSyncInterval: fullSyncIntervalInMilliseconds })
					.subscribe({
						next: ({ type, data }) => {
							// In Node, we need to wait for queries to be synced to prevent returning empty arrays.
							// In the Browser, we can begin returning data once subscriptions are in place.
							const readyType = isNode
								? ControlMessage.SYNC_ENGINE_SYNC_QUERIES_READY
								: ControlMessage.SYNC_ENGINE_STORAGE_SUBSCRIBED;

							if (type === readyType) {
								this.initResolve();
							}

							Hub.dispatch('datastore', {
								event: type,
								data,
							});
						},
						error: err => {
							logger.warn('Sync error', err);
							this.initReject();
						},
					});
			} else {
				logger.warn(
					"Data won't be synchronized. No GraphQL endpoint configured. Did you forget `Amplify.configure(awsconfig)`?",
					{
						config: this.amplifyConfig,
					}
				);

				this.initResolve();
			}

			await this.initialized;
		}, 'datastore start');
	};

	query: {
		<T extends PersistentModel>(
			modelConstructor: PersistentModelConstructor<T>,
			identifier: IdentifierFieldOrIdentifierObject<
				T,
				PersistentModelMetaData<T>
			>
		): Promise<T | undefined>;
		<T extends PersistentModel>(
			modelConstructor: PersistentModelConstructor<T>,
			criteria?:
				| RecursiveModelPredicateExtender<T>
				| typeof PredicateAll
				| null,
			paginationProducer?: ProducerPaginationInput<T>
		): Promise<T[]>;
	} = async <T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		identifierOrCriteria?:
			| IdentifierFieldOrIdentifierObject<T, PersistentModelMetaData<T>>
			| RecursiveModelPredicateExtender<T>
			| typeof PredicateAll
			| null,
		paginationProducer?: ProducerPaginationInput<T>
	): Promise<T | T[] | undefined> => {
		return this.runningProcesses.add(async () => {
			await this.start();

			let result: T[];

			if (!this.storage) {
				throw new Error('No storage to query');
			}

			//#region Input validation

			if (!isValidModelConstructor(modelConstructor)) {
				const msg = 'Constructor is not for a valid model';
				logger.error(msg, { modelConstructor });
				console.error(new Error('ahhhh'), modelConstructor);
				throw new Error(msg);
			}

			if (typeof identifierOrCriteria === 'string') {
				if (paginationProducer !== undefined) {
					logger.warn('Pagination is ignored when querying by id');
				}
			}

			const modelDefinition = getModelDefinition(modelConstructor);
			if (!modelDefinition) {
				throw new Error('Invalid model definition provided!');
			}

			const pagination = this.processPagination(
				modelDefinition,
				paginationProducer
			);

			const keyFields = extractPrimaryKeyFieldNames(modelDefinition);

			if (isQueryOne(identifierOrCriteria)) {
				if (keyFields.length > 1) {
					const msg = errorMessages.queryByPkWithCompositeKeyPresent;
					logger.error(msg, { keyFields });

					throw new Error(msg);
				}

				const predicate = ModelPredicateCreator.createForSingleField<T>(
					modelDefinition,
					keyFields[0],
					identifierOrCriteria
				);

				result = await this.storage.query<T>(
					modelConstructor,
					predicate,
					pagination
				);
			} else {
				// Object is being queried using object literal syntax
				if (isIdentifierObject(<T>identifierOrCriteria, modelDefinition)) {
					const predicate = ModelPredicateCreator.createForPk<T>(
						modelDefinition,
						<T>identifierOrCriteria
					);
					result = await this.storage.query<T>(
						modelConstructor,
						predicate,
						pagination
					);
				} else if (
					!identifierOrCriteria ||
					isPredicatesAll(identifierOrCriteria)
				) {
					result = await this.storage?.query<T>(
						modelConstructor,
						undefined,
						pagination
					);
				} else {
					const seedPredicate = recursivePredicateFor<T>({
						builder: modelConstructor,
						schema: modelDefinition,
						pkField: getModelPKFieldName(modelConstructor),
					});
					const predicate = (
						identifierOrCriteria as RecursiveModelPredicateExtender<T>
					)(seedPredicate).__query;
					result = (await predicate.fetch(this.storage)) as T[];
					result = inMemoryPagination(result, pagination);
				}
			}

			//#endregion

			const returnOne =
				isQueryOne(identifierOrCriteria) ||
				isIdentifierObject(identifierOrCriteria, modelDefinition);

			return returnOne ? result[0] : result;
		}, 'datastore query');
	};

	save = async <T extends PersistentModel>(
		model: T,
		condition?: ModelPredicateExtender<T>
	): Promise<T> => {
		return this.runningProcesses.add(async () => {
			await this.start();

			if (!this.storage) {
				throw new Error('No storage to save to');
			}

			// Immer patches for constructing a correct update mutation input
			// Allows us to only include changed fields for updates
			const patchesTuple = modelPatchesMap.get(model);

			const modelConstructor: PersistentModelConstructor<T> | undefined = model
				? <PersistentModelConstructor<T>>model.constructor
				: undefined;

			if (!isValidModelConstructor(modelConstructor)) {
				const msg = 'Object is not an instance of a valid model';
				logger.error(msg, { model });

				throw new Error(msg);
			}

			const modelDefinition = getModelDefinition(modelConstructor);
			if (!modelDefinition) {
				throw new Error('Model Definition could not be found for model');
			}

			const producedCondition = condition
				? condition(
						predicateFor({
							builder: modelConstructor as PersistentModelConstructor<T>,
							schema: modelDefinition,
							pkField: extractPrimaryKeyFieldNames(modelDefinition),
						})
				  ).__query.toStoragePredicate<T>()
				: undefined;

			const [savedModel] = await this.storage.runExclusive(async s => {
				const saved = await s.save(
					model,
					producedCondition,
					undefined,
					patchesTuple
				);
				return s.query<T>(
					modelConstructor,
					ModelPredicateCreator.createForPk(modelDefinition, model)
				);
			});

			return savedModel;
		}, 'datastore save');
	};

	setConflictHandler = (config: DataStoreConfig): ConflictHandler => {
		const { DataStore: configDataStore } = config;

		const conflictHandlerIsDefault: () => boolean = () =>
			this.conflictHandler === defaultConflictHandler;

		if (configDataStore && configDataStore.conflictHandler) {
			return configDataStore.conflictHandler;
		}
		if (conflictHandlerIsDefault() && config.conflictHandler) {
			return config.conflictHandler;
		}

		return this.conflictHandler || defaultConflictHandler;
	};

	setErrorHandler = (config: DataStoreConfig): ErrorHandler => {
		const { DataStore: configDataStore } = config;

		const errorHandlerIsDefault: () => boolean = () =>
			this.errorHandler === defaultErrorHandler;

		if (configDataStore && configDataStore.errorHandler) {
			return configDataStore.errorHandler;
		}
		if (errorHandlerIsDefault() && config.errorHandler) {
			return config.errorHandler;
		}

		return this.errorHandler || defaultErrorHandler;
	};

	delete: {
		<T extends PersistentModel>(
			modelConstructor: PersistentModelConstructor<T>,
			identifier: IdentifierFieldOrIdentifierObject<
				T,
				PersistentModelMetaData<T>
			>
		): Promise<T[]>;
		<T extends PersistentModel>(
			modelConstructor: PersistentModelConstructor<T>,
			condition: ModelPredicateExtender<T> | typeof PredicateAll
		): Promise<T[]>;
		<T extends PersistentModel>(
			model: T,
			condition?: ModelPredicateExtender<T>
		): Promise<T>;
	} = async <T extends PersistentModel>(
		modelOrConstructor: T | PersistentModelConstructor<T>,
		identifierOrCriteria?:
			| IdentifierFieldOrIdentifierObject<T, PersistentModelMetaData<T>>
			| ModelPredicateExtender<T>
			| typeof PredicateAll
	): Promise<T | T[]> => {
		return this.runningProcesses.add(async () => {
			await this.start();

			if (!this.storage) {
				throw new Error('No storage to delete from');
			}

			let condition: ModelPredicate<T> | undefined;

			if (!modelOrConstructor) {
				const msg = 'Model or Model Constructor required';
				logger.error(msg, { modelOrConstructor });

				throw new Error(msg);
			}

			if (isValidModelConstructor<T>(modelOrConstructor)) {
				const modelConstructor = modelOrConstructor;

				if (!identifierOrCriteria) {
					const msg =
						'Id to delete or criteria required. Do you want to delete all? Pass Predicates.ALL';
					logger.error(msg, { identifierOrCriteria });

					throw new Error(msg);
				}

				const modelDefinition = getModelDefinition(modelConstructor);

				if (!modelDefinition) {
					throw new Error(
						'Could not find model definition for modelConstructor.'
					);
				}

				if (typeof identifierOrCriteria === 'string') {
					const keyFields = extractPrimaryKeyFieldNames(modelDefinition);

					if (keyFields.length > 1) {
						const msg = errorMessages.deleteByPkWithCompositeKeyPresent;
						logger.error(msg, { keyFields });

						throw new Error(msg);
					}

					condition = ModelPredicateCreator.createForSingleField<T>(
						modelDefinition,
						keyFields[0],
						identifierOrCriteria
					);
				} else {
					if (isIdentifierObject(identifierOrCriteria, modelDefinition)) {
						condition = ModelPredicateCreator.createForPk<T>(
							modelDefinition,
							<T>identifierOrCriteria
						);
					} else {
						condition = (identifierOrCriteria as ModelPredicateExtender<T>)(
							predicateFor({
								builder: modelConstructor as PersistentModelConstructor<T>,
								schema: modelDefinition,
								pkField: extractPrimaryKeyFieldNames(modelDefinition),
							})
						).__query.toStoragePredicate<T>();
					}

					if (
						!condition ||
						!ModelPredicateCreator.isValidPredicate(condition)
					) {
						const msg =
							'Criteria required. Do you want to delete all? Pass Predicates.ALL';
						logger.error(msg, { condition });

						throw new Error(msg);
					}
				}

				const [deleted] = await this.storage.delete(
					modelConstructor,
					condition
				);

				return deleted;
			} else {
				const model = modelOrConstructor;
				const modelConstructor = Object.getPrototypeOf(model || {})
					.constructor as PersistentModelConstructor<T>;

				if (!isValidModelConstructor(modelConstructor)) {
					const msg = 'Object is not an instance of a valid model';
					logger.error(msg, { model });

					throw new Error(msg);
				}

				const modelDefinition = getModelDefinition(modelConstructor);

				if (!modelDefinition) {
					throw new Error(
						'Could not find model definition for modelConstructor.'
					);
				}

				const pkPredicate = ModelPredicateCreator.createForPk<T>(
					modelDefinition,
					model
				);

				if (identifierOrCriteria) {
					if (typeof identifierOrCriteria !== 'function') {
						const msg = 'Invalid criteria';
						logger.error(msg, { identifierOrCriteria });

						throw new Error(msg);
					}

					condition = (identifierOrCriteria as ModelPredicateExtender<T>)(
						predicateFor({
							builder: modelConstructor as PersistentModelConstructor<T>,
							schema: modelDefinition,
							pkField: extractPrimaryKeyFieldNames(modelDefinition),
						})
					).__query.toStoragePredicate<T>(pkPredicate);
				} else {
					condition = pkPredicate;
				}

				const [[deleted]] = await this.storage.delete(model, condition);

				return deleted;
			}
		}, 'datastore delete');
	};

	observe: {
		(): Observable<SubscriptionMessage<PersistentModel>>;

		<T extends PersistentModel>(
			modelConstructor: PersistentModelConstructor<T>,
			identifier: string
		): Observable<SubscriptionMessage<T>>;

		<T extends PersistentModel>(
			modelConstructor: PersistentModelConstructor<T>,
			criteria?: RecursiveModelPredicateExtender<T> | typeof PredicateAll
		): Observable<SubscriptionMessage<T>>;

		<T extends PersistentModel>(model: T): Observable<SubscriptionMessage<T>>;
	} = <T extends PersistentModel>(
		modelOrConstructor?: T | PersistentModelConstructor<T>,
		identifierOrCriteria?:
			| string
			| RecursiveModelPredicateExtender<T>
			| typeof PredicateAll
	): Observable<SubscriptionMessage<T>> => {
		let executivePredicate: GroupCondition;

		const modelConstructor: PersistentModelConstructor<T> | undefined =
			modelOrConstructor && isValidModelConstructor<T>(modelOrConstructor)
				? modelOrConstructor
				: undefined;

		if (modelOrConstructor && modelConstructor === undefined) {
			const model = <T>modelOrConstructor;
			const modelConstructor =
				model && (<Object>Object.getPrototypeOf(model)).constructor;

			if (isValidModelConstructor<T>(modelConstructor)) {
				if (identifierOrCriteria) {
					logger.warn('idOrCriteria is ignored when using a model instance', {
						model,
						identifierOrCriteria,
					});
				}

				return this.observe(modelConstructor, model.id);
			} else {
				const msg =
					'The model is not an instance of a PersistentModelConstructor';
				logger.error(msg, { model });

				throw new Error(msg);
			}
		}

		// observe should not accept object literal syntax
		if (
			identifierOrCriteria &&
			modelConstructor &&
			isIdentifierObject(
				identifierOrCriteria,
				getModelDefinition(modelConstructor!)!
			)
		) {
			const msg = errorMessages.observeWithObjectLiteral;
			logger.error(msg, { objectLiteral: identifierOrCriteria });

			throw new Error(msg);
		}

		if (identifierOrCriteria !== undefined && modelConstructor === undefined) {
			const msg = 'Cannot provide criteria without a modelConstructor';
			logger.error(msg, identifierOrCriteria);
			throw new Error(msg);
		}

		if (modelConstructor && !isValidModelConstructor(modelConstructor)) {
			const msg = 'Constructor is not for a valid model';
			logger.error(msg, { modelConstructor });

			throw new Error(msg);
		}

		if (modelConstructor && typeof identifierOrCriteria === 'string') {
			const buildIdPredicate = seed => seed.id.eq(identifierOrCriteria);
			executivePredicate = buildIdPredicate(
				buildSeedPredicate(modelConstructor)
			).__query;
		} else if (modelConstructor && typeof identifierOrCriteria === 'function') {
			executivePredicate = (
				identifierOrCriteria as RecursiveModelPredicateExtender<T>
			)(buildSeedPredicate(modelConstructor) as any).__query;
		}

		return new Observable<SubscriptionMessage<T>>(observer => {
			let source: ZenObservable.Subscription;

			this.runningProcesses
				.add(async () => {
					await this.start();

					if (!this.storage) {
						throw new Error('No storage to query');
					}

					// Filter the events returned by Storage according to namespace,
					// append original element data, and subscribe to the observable
					source = this.storage
						.observe(modelConstructor)
						.filter(({ model }) => namespaceResolver(model) === USER)
						.subscribe({
							next: item =>
								this.runningProcesses.isOpen &&
								this.runningProcesses.add(async () => {
									// the `element` doesn't necessarily contain all item details or
									// have related records attached consistently with that of a query()
									// result item. for consistency, we attach them here.

									let message = item;

									// as long as we're not dealing with a DELETE, we need to fetch a fresh
									// item from storage to ensure it's fully populated.
									if (item.opType !== 'DELETE') {
										const modelDefinition = getModelDefinition(item.model);
										const keyFields = extractPrimaryKeyFieldNames(
											modelDefinition!
										);
										const primaryKeysAndValues = extractPrimaryKeysAndValues(
											item.element,
											keyFields
										);
										const freshElement = await this.query(
											item.model,
											primaryKeysAndValues
										);
										message = {
											...message,
											element: freshElement as T,
										};
									}

									// if (executivePredicate)
									// 	console.log('checking item', message.element);

									if (
										!executivePredicate ||
										(await executivePredicate.matches(message.element))
									) {
										observer.next(message as SubscriptionMessage<T>);
									}
								}, 'datastore observe message handler'),
							error: err => observer.error(err),
							complete: () => observer.complete(),
						});
				}, 'datastore observe observable initialization')
				.catch(error => {
					observer.error(error);
				});

			// better than no cleaner, but if the subscriber is handling the
			// complete() message async and not registering with the context,
			// this will still be problematic.
			return this.runningProcesses.addCleaner(async () => {
				if (source) {
					source.unsubscribe();
				}
			}, 'datastore observe cleaner');
		});
	};

	observeQuery: {
		<T extends PersistentModel>(
			modelConstructor: PersistentModelConstructor<T>,
			criteria?: RecursiveModelPredicateExtender<T> | typeof PredicateAll,
			paginationProducer?: ObserveQueryOptions<T>
		): Observable<DataStoreSnapshot<T>>;
	} = <T extends PersistentModel>(
		model: PersistentModelConstructor<T>,
		criteria?: RecursiveModelPredicateExtender<T> | typeof PredicateAll,
		options?: ObserveQueryOptions<T>
	): Observable<DataStoreSnapshot<T>> => {
		return new Observable<DataStoreSnapshot<T>>(observer => {
			const items = new Map<string, T>();
			const itemsChanged = new Map<string, T>();
			let deletedItemIds: string[] = [];
			let handle: ZenObservable.Subscription;
			// let predicate: ModelPredicate<T> | undefined;
			let executivePredicate: GroupCondition | undefined;

			/**
			 * As the name suggests, this geneates a snapshot in the form of
			 * 	`{items: T[], isSynced: boolean}`
			 * and sends it to the observer.
			 *
			 * SIDE EFFECT: The underlying generation and emission methods may touch:
			 * `items`, `itemsChanged`, and `deletedItemIds`.
			 *
			 * Refer to `generateSnapshot` and `emitSnapshot` for more details.
			 */
			const generateAndEmitSnapshot = (): void => {
				const snapshot = generateSnapshot();
				emitSnapshot(snapshot);
			};

			// a mechanism to return data after X amount of seconds OR after the
			// "limit" (itemsChanged >= this.syncPageSize) has been reached, whichever comes first
			const limitTimerRace = new DeferredCallbackResolver({
				callback: generateAndEmitSnapshot,
				errorHandler: observer.error,
				maxInterval: 2000,
			});

			const { sort } = options || {};
			const sortOptions = sort ? { sort } : undefined;

			const modelDefinition = getModelDefinition(model);
			if (!modelDefinition) {
				throw new Error('Could not find model definition.');
			}

			// = buildSeedPredicate(model).__query;

			// if (typeof identifierOrCriteria === 'string') {
			// 	const buildIdPredicate = seed => seed.id.eq(identifierOrCriteria);
			// 	executivePredicate = buildIdPredicate(buildSeedPredicate(model)).__query;
			// } else
			if (model && typeof criteria === 'function') {
				executivePredicate = (criteria as RecursiveModelPredicateExtender<T>)(
					buildSeedPredicate(model)
				).__query;
			} else if (isPredicatesAll(criteria)) {
				executivePredicate = undefined;
			}

			const keyFields = extractPrimaryKeyFieldNames(modelDefinition);

			/**
			 * TODO: do we need this isQueryOne() stuff? I think svidgen introduced it to replicate
			 * what observe() was doing. but, observe() can take a PK, whereas observeQuery() only
			 * accepts a predicate builder.
			 *
			 * See: https://github.com/aws-amplify/amplify-js/pull/9879/files
			 *
			 * I *think* we can safely omit this... I don't think we need to handle isQueryOne case
			 * at all..
			 *
			 */

			// if (isQueryOne(criteria)) {
			// 	predicate = ModelPredicateCreator.createForSingleField<T>(
			// 		modelDefinition,
			// 		keyFields[0],
			// 		criteria
			// 	);
			// } else {
			// 	if (isPredicatesAll(criteria)) {
			// 		// Predicates.ALL means "all records", so no predicate (undefined)
			// 		predicate = undefined;
			// 	} else {
			// 		predicate = ModelPredicateCreator.createFromExisting(
			// 			modelDefinition,
			// 			criteria
			// 		);
			// 	}
			// }

			// const { predicates, type: predicateGroupType } =
			// 	ModelPredicateCreator.getPredicates(predicate, false) || {};
			// const hasPredicate = !!predicates;

			this.runningProcesses
				.add(async () => {
					try {
						// first, query and return any locally-available records
						(await this.query(model, criteria, sortOptions)).forEach(item => {
							const itemModelDefinition = getModelDefinition(model);
							const idOrPk = getIdentifierValue(itemModelDefinition!, item);
							items.set(idOrPk, item);
						});

						// Observe the model and send a stream of updates (debounced).
						// We need to post-filter results instead of passing criteria through
						// to have visibility into items that move from in-set to out-of-set.
						// We need to explicitly remove those items from the existing snapshot.
						handle = this.observe(model).subscribe(
							({ element, model, opType }) =>
								this.runningProcesses.isOpen &&
								this.runningProcesses.add(async () => {
									const itemModelDefinition = getModelDefinition(model)!;
									const idOrPk = getIdentifierValue(
										itemModelDefinition,
										element
									);
									if (
										executivePredicate &&
										!(await executivePredicate.matches(element))
									) {
										if (
											opType === 'UPDATE' &&
											(items.has(idOrPk) || itemsChanged.has(idOrPk))
										) {
											// tracking as a "deleted item" will include the item in
											// page limit calculations and ensure it is removed from the
											// final items collection, regardless of which collection(s)
											// it is currently in. (I mean, it could be in both, right!?)
											deletedItemIds.push(idOrPk);
										} else {
											// ignore updates for irrelevant/filtered items.
											return;
										}
									}

									// Flag items which have been recently deleted
									// NOTE: Merging of separate operations to the same model instance is handled upstream
									// in the `mergePage` method within src/sync/merger.ts. The final state of a model instance
									// depends on the LATEST record (for a given id).
									if (opType === 'DELETE') {
										deletedItemIds.push(idOrPk);
									} else {
										itemsChanged.set(idOrPk, element);
									}

									const isSynced =
										this.sync?.getModelSyncedStatus(model) ?? false;

									const limit =
										itemsChanged.size - deletedItemIds.length >=
										this.syncPageSize;

									if (limit || isSynced) {
										// console.log('emitting here on element received', element);
										limitTimerRace.resolve();
									}

									// kicks off every subsequent race as results sync down
									limitTimerRace.start();
								}, 'handle observeQuery observed event')
						);

						// returns a set of initial/locally-available results
						generateAndEmitSnapshot();
					} catch (err) {
						observer.error(err);
					}
				}, 'datastore observequery startup')
				.catch(error => {
					observer.error(error);
				});

			/**
			 * Combines the `items`, `itemsChanged`, and `deletedItemIds` collections into
			 * a snapshot in the form of `{ items: T[], isSynced: boolean}`.
			 *
			 * SIDE EFFECT: The shared `items` collection is recreated.
			 */
			const generateSnapshot = (): DataStoreSnapshot<T> => {
				const isSynced = this.sync?.getModelSyncedStatus(model) ?? false;
				const itemsArray = [
					...Array.from(items.values()),
					...Array.from(itemsChanged.values()),
				];

				if (options?.sort) {
					sortItems(itemsArray);
				}

				items.clear();
				itemsArray.forEach(item => {
					const itemModelDefinition = getModelDefinition(model);
					const idOrPk = getIdentifierValue(itemModelDefinition!, item);
					items.set(idOrPk, item);
				});

				// remove deleted items from the final result set
				deletedItemIds.forEach(idOrPk => items.delete(idOrPk));

				return {
					items: Array.from(items.values()),
					isSynced,
				};
			};

			/**
			 * Emits the list of items to the observer.
			 *
			 * SIDE EFFECT: `itemsChanged` and `deletedItemIds` are cleared to prepare
			 * for the next snapshot.
			 *
			 * @param snapshot The generated items data to emit.
			 */
			const emitSnapshot = (snapshot: DataStoreSnapshot<T>): void => {
				// send the generated snapshot to the primary subscription.
				// NOTE: This observer's handler *could* be async ...
				observer.next(snapshot);

				// reset the changed items sets
				itemsChanged.clear();
				deletedItemIds = [];
			};

			/**
			 * Sorts an `Array` of `T` according to the sort instructions given in the
			 * original  `observeQuery()` call.
			 *
			 * @param itemsToSort A array of model type.
			 */
			const sortItems = (itemsToSort: T[]): void => {
				const modelDefinition = getModelDefinition(model);
				const pagination = this.processPagination(modelDefinition!, options);

				const sortPredicates = ModelSortPredicateCreator.getPredicates(
					pagination!.sort!
				);

				if (sortPredicates.length) {
					const compareFn = sortCompareFunction(sortPredicates);
					itemsToSort.sort(compareFn);
				}
			};

			/**
			 * Force one last snapshot when the model is fully synced.
			 *
			 * This reduces latency for that last snapshot, which will otherwise
			 * wait for the configured timeout.
			 *
			 * @param payload The payload from the Hub event.
			 */
			const hubCallback = ({ payload }): void => {
				const { event, data } = payload;
				if (
					event === ControlMessage.SYNC_ENGINE_MODEL_SYNCED &&
					data?.model?.name === model.name
				) {
					generateAndEmitSnapshot();
					Hub.remove('datastore', hubCallback);
				}
			};
			Hub.listen('datastore', hubCallback);

			return this.runningProcesses.addCleaner(async () => {
				if (handle) {
					handle.unsubscribe();
				}
			}, 'datastore observequery cleaner');
		});
	};

	configure = (config: DataStoreConfig = {}) => {
		this.amplifyContext.Auth = this.Auth;
		this.amplifyContext.API = this.API;
		this.amplifyContext.Cache = this.Cache;

		const {
			DataStore: configDataStore,
			authModeStrategyType: configAuthModeStrategyType,
			conflictHandler: configConflictHandler,
			errorHandler: configErrorHandler,
			maxRecordsToSync: configMaxRecordsToSync,
			syncPageSize: configSyncPageSize,
			fullSyncInterval: configFullSyncInterval,
			syncExpressions: configSyncExpressions,
			authProviders: configAuthProviders,
			storageAdapter: configStorageAdapter,
			...configFromAmplify
		} = config;

		this.amplifyConfig = {
			...configFromAmplify,
			...this.amplifyConfig,
		};

		this.conflictHandler = this.setConflictHandler(config);
		this.errorHandler = this.setErrorHandler(config);

		const authModeStrategyType =
			(configDataStore && configDataStore.authModeStrategyType) ||
			configAuthModeStrategyType ||
			AuthModeStrategyType.DEFAULT;

		switch (authModeStrategyType) {
			case AuthModeStrategyType.MULTI_AUTH:
				this.authModeStrategy = multiAuthStrategy(this.amplifyContext);
				break;
			case AuthModeStrategyType.DEFAULT:
				this.authModeStrategy = defaultAuthStrategy;
				break;
			default:
				this.authModeStrategy = defaultAuthStrategy;
				break;
		}

		// store on config object, so that Sync, Subscription, and Mutation processors can have access
		this.amplifyConfig.authProviders =
			(configDataStore && configDataStore.authProviders) || configAuthProviders;

		this.syncExpressions =
			(configDataStore && configDataStore.syncExpressions) ||
			configSyncExpressions ||
			this.syncExpressions;

		this.maxRecordsToSync =
			(configDataStore && configDataStore.maxRecordsToSync) ||
			configMaxRecordsToSync ||
			this.maxRecordsToSync ||
			10000;

		// store on config object, so that Sync, Subscription, and Mutation processors can have access
		this.amplifyConfig.maxRecordsToSync = this.maxRecordsToSync;

		this.syncPageSize =
			(configDataStore && configDataStore.syncPageSize) ||
			configSyncPageSize ||
			this.syncPageSize ||
			1000;

		// store on config object, so that Sync, Subscription, and Mutation processors can have access
		this.amplifyConfig.syncPageSize = this.syncPageSize;

		this.fullSyncInterval =
			(configDataStore && configDataStore.fullSyncInterval) ||
			configFullSyncInterval ||
			this.fullSyncInterval ||
			24 * 60; // 1 day

		this.storageAdapter =
			(configDataStore && configDataStore.storageAdapter) ||
			configStorageAdapter ||
			this.storageAdapter ||
			undefined;

		this.sessionId = this.retrieveSessionId()!;
	};

	/**
	 * Clears all data from storage and removes all data, schema info, other
	 * initialization details, and then stops DataStore.
	 *
	 * That said, reinitialization is required after clearing. This can be done
	 * by explicitiliy calling `start()` or any method that implicitly starts
	 * DataStore, such as `query()`, `save()`, or `delete()`.
	 */
	async clear() {
		await this.runningProcesses.close();

		if (this.storage === undefined) {
			// connect to storage so that it can be cleared without fully starting DataStore
			this.storage = new Storage(
				schema,
				namespaceResolver,
				getModelConstructorByModelName,
				modelInstanceCreator,
				this.storageAdapter,
				this.sessionId
			);
			await this.storage.init();
		}

		if (syncSubscription && !syncSubscription.closed) {
			syncSubscription.unsubscribe();
		}

		if (this.sync) {
			await this.sync.stop();
		}

		await this.storage.clear();

		this.initialized = undefined; // Should re-initialize when start() is called.
		this.storage = undefined;
		this.sync = undefined;
		this.syncPredicates = new WeakMap<SchemaModel, ModelPredicate<any>>();

		this.runningProcesses = new BackgroundProcessManager();
	}

	/**
	 * Stops all DataStore sync activities.
	 *
	 * TODO: "Waits for graceful termination of
	 * running queries and terminates subscriptions."
	 */
	async stop(this: InstanceType<typeof DataStore>) {
		await this.runningProcesses.close();

		if (syncSubscription && !syncSubscription.closed) {
			syncSubscription.unsubscribe();
		}

		if (this.sync) {
			await this.sync.stop();
		}

		this.initialized = undefined; // Should re-initialize when start() is called.
		this.sync = undefined;

		this.runningProcesses = new BackgroundProcessManager();
	}

	/**
	 * Validates given pagination input from a query and creates a pagination
	 * argument for use against the storage layer.
	 *
	 * @param modelDefinition
	 * @param paginationProducer
	 */
	private processPagination<T extends PersistentModel>(
		modelDefinition: SchemaModel,
		paginationProducer?: ProducerPaginationInput<T>
	): PaginationInput<T> | undefined {
		let sortPredicate: SortPredicate<T> | undefined;
		const { limit, page, sort } = paginationProducer || {};

		if (limit === undefined && page === undefined && sort === undefined) {
			return undefined;
		}

		if (page !== undefined && limit === undefined) {
			throw new Error('Limit is required when requesting a page');
		}

		if (page !== undefined) {
			if (typeof page !== 'number') {
				throw new Error('Page should be a number');
			}

			if (page < 0) {
				throw new Error("Page can't be negative");
			}
		}

		if (limit !== undefined) {
			if (typeof limit !== 'number') {
				throw new Error('Limit should be a number');
			}

			if (limit < 0) {
				throw new Error("Limit can't be negative");
			}
		}

		if (sort) {
			sortPredicate = ModelSortPredicateCreator.createFromExisting(
				modelDefinition,
				sort
			);
		}

		return {
			limit,
			page,
			sort: sortPredicate,
		};
	}

	/**
	 * Examines the configured `syncExpressions` and produces a WeakMap of
	 * SchemaModel -> predicate to use during sync.
	 */
	private async processSyncExpressions(): Promise<
		WeakMap<SchemaModel, ModelPredicate<any>>
	> {
		if (!this.syncExpressions || !this.syncExpressions.length) {
			return new WeakMap<SchemaModel, ModelPredicate<any>>();
		}

		const syncPredicates = await Promise.all(
			this.syncExpressions.map(
				async (
					syncExpression: SyncExpression
				): Promise<[SchemaModel, ModelPredicate<any>]> => {
					const { modelConstructor, conditionProducer } = await syncExpression;
					const modelDefinition = getModelDefinition(modelConstructor)!;

					// conditionProducer is either a predicate, e.g. (c) => c.field('eq', 1)
					// OR a function/promise that returns a predicate
					const condition = await this.unwrapPromise(conditionProducer);
					if (isPredicatesAll(condition)) {
						return [modelDefinition as any, null as any];
					}

					const predicate = condition(
						predicateFor({
							builder: modelConstructor,
							schema: modelDefinition,
							pkField: extractPrimaryKeyFieldNames(modelDefinition),
						})
					).__query.toStoragePredicate<any>();

					return [modelDefinition as any, predicate as any];
				}
			)
		);

		return this.weakMapFromEntries(syncPredicates);
	}

	private createFromCondition(
		modelDefinition: SchemaModel,
		condition: ProducerModelPredicate<PersistentModel>
	) {
		try {
			return ModelPredicateCreator.createFromExisting(
				modelDefinition,
				condition
			);
		} catch (error) {
			logger.error('Error creating Sync Predicate');
			throw error;
		}
	}

	private async unwrapPromise<T extends PersistentModel>(
		conditionProducer
	): Promise<ModelPredicateExtender<T>> {
		try {
			const condition = await conditionProducer();
			return condition;
		} catch (error) {
			if (error instanceof TypeError) {
				return conditionProducer;
			}
			throw error;
		}
	}

	private weakMapFromEntries(
		entries: [SchemaModel, ModelPredicate<any>][]
	): WeakMap<SchemaModel, ModelPredicate<any>> {
		return entries.reduce((map, [modelDefinition, predicate]) => {
			if (map.has(modelDefinition)) {
				const { name } = modelDefinition;
				logger.warn(
					`You can only utilize one Sync Expression per model.
          Subsequent sync expressions for the ${name} model will be ignored.`
				);
				return map;
			}

			if (predicate) {
				map.set(modelDefinition, predicate);
			}

			return map;
		}, new WeakMap<SchemaModel, ModelPredicate<any>>());
	}

	/**
	 * A session ID to allow CMS to open databases against multiple apps.
	 * This session ID is only expected be set by AWS Amplify Studio.
	 */
	private retrieveSessionId(): string | undefined {
		try {
			const sessionId = sessionStorage.getItem('datastoreSessionId');

			if (sessionId) {
				const { aws_appsync_graphqlEndpoint } = this.amplifyConfig;

				const appSyncUrl = aws_appsync_graphqlEndpoint.split('/')[2];
				const [appSyncId] = appSyncUrl.split('.');

				return `${sessionId}-${appSyncId}`;
			}
		} catch {}

		return undefined;
	}
}

const instance = new DataStore();
Amplify.register(instance);

export { DataStore as DataStoreClass, initSchema, instance as DataStore };
