import API from '@aws-amplify/api';
import { Amplify, ConsoleLogger as Logger, Hub, JS } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';
import Cache from '@aws-amplify/cache';
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
} from '../types';
import {
	DATASTORE,
	errorMessages,
	establishRelationAndKeys,
	exhaustiveCheck,
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
	extractPrimaryKeyFieldNames,
	extractPrimaryKeysAndValues,
	isIdManaged,
	isIdOptionallyManaged,
	validatePredicate,
	mergePatches,
} from '../util';
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

	return schema.namespaces[namespace].models[modelConstructor.name];
};

const isValidModelConstructor = <T extends PersistentModel>(
	obj: any
): obj is PersistentModelConstructor<T> => {
	return isModelConstructor(obj) && modelNamespaceMap.has(obj);
};

const namespaceResolver: NamespaceResolver = modelConstructor =>
	modelNamespaceMap.get(modelConstructor);

// exporting syncClasses for testing outbox.test.ts
export let syncClasses: TypeConstructorMap;
let userClasses: TypeConstructorMap;
let dataStoreClasses: TypeConstructorMap;
let storageClasses: TypeConstructorMap;

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

				if (parents.every(x => result.has(x))) {
					result.set(modelName, parents);
				}
			}

			Array.from(result.keys()).forEach(x => modelAssociations.delete(x));
		}

		schema.namespaces[namespace].modelTopologicalOrdering = result;
	});

	return userClasses;
};

/* Checks if the schema has been initialized by initSchema().
 *
 * Call this function before accessing schema.
 * Currently this only needs to be called in start() and clear() because all other functions will call start first.
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
			const clazz = createNonModelClass(typeDefinition);
			classes[typeName] = clazz;
		}
	);

	return classes;
};

export declare type ModelInstanceCreator = typeof modelInstanceCreator;

const instancesMetadata = new WeakSet<ModelInit<unknown, unknown>>();

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
					!validateScalar(v)
				) {
					throw new Error(
						`Field ${name} should be of type ${type}, validation failed. ${v}`
					);
				}
			} else if (isNonModelFieldType(type)) {
				// do not check non model fields if undefined or null
				if (!isNullOrUndefined(v)) {
					const subNonModelDefinition =
						schema.namespaces.user.nonModels[type.nonModel];
					const modelValidator = validateModelFields(subNonModelDefinition);

					if (isArray) {
						let errorTypeText: string = type.nonModel;
						if (!isRequired) {
							errorTypeText = `${type.nonModel} | null | undefined`;
						}
						if (!Array.isArray(v)) {
							throw new Error(
								`Field ${name} should be of type [${errorTypeText}], ${typeof v} received. ${v}`
							);
						}

						v.forEach(item => {
							if (
								(isNullOrUndefined(item) && isRequired) ||
								(typeof item !== 'object' && typeof item !== 'undefined')
							) {
								throw new Error(
									`All elements in the ${name} array should be of type ${
										type.nonModel
									}, [${typeof item}] received. ${item}`
								);
							}

							if (!isNullOrUndefined(item)) {
								Object.keys(subNonModelDefinition.fields).forEach(subKey => {
									modelValidator(subKey, item[subKey]);
								});
							}
						});
					} else {
						if (typeof v !== 'object') {
							throw new Error(
								`Field ${name} should be of type ${
									type.nonModel
								}, ${typeof v} recieved. ${v}`
							);
						}

						Object.keys(subNonModelDefinition.fields).forEach(subKey => {
							modelValidator(subKey, v[subKey]);
						});
					}
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
					const [existingPatches, existingSource] = modelPatchesMap.get(source);
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

	return clazz;
};

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

	private amplifyConfig: Record<string, any> = {};
	private authModeStrategy: AuthModeStrategy;
	private conflictHandler: ConflictHandler;
	private errorHandler: (error: SyncError<PersistentModel>) => void;
	private fullSyncInterval: number;
	private initialized?: Promise<void>;
	private initReject: Function;
	private initResolve: Function;
	private maxRecordsToSync: number;
	private storage?: Storage;
	private sync?: SyncEngine;
	private syncPageSize: number;
	private syncExpressions: SyncExpression[];
	private syncPredicates: WeakMap<SchemaModel, ModelPredicate<any>> =
		new WeakMap<SchemaModel, ModelPredicate<any>>();
	private sessionId: string;
	private storageAdapter: Adapter;
	// object that gets passed to descendent classes. Allows us to pass these down by reference
	private amplifyContext: AmplifyContext = {
		Auth: this.Auth,
		API: this.API,
		Cache: this.Cache,
	};

	getModuleName() {
		return 'DataStore';
	}

	start = async (): Promise<void> => {
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

			// tslint:disable-next-line:max-line-length
			const fullSyncIntervalInMilliseconds = this.fullSyncInterval * 1000 * 60; // fullSyncInterval from param is in minutes
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
			criteria?: ProducerModelPredicate<T> | typeof PredicateAll,
			paginationProducer?: ProducerPaginationInput<T>
		): Promise<T[]>;
	} = async <T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		identifierOrCriteria?:
			| IdentifierFieldOrIdentifierObject<T, PersistentModelMetaData<T>>
			| ProducerModelPredicate<T>
			| typeof PredicateAll,
		paginationProducer?: ProducerPaginationInput<T>
	): Promise<T | T[] | undefined> => {
		await this.start();

		//#region Input validation

		if (!isValidModelConstructor(modelConstructor)) {
			const msg = 'Constructor is not for a valid model';
			logger.error(msg, { modelConstructor });

			throw new Error(msg);
		}

		if (typeof identifierOrCriteria === 'string') {
			if (paginationProducer !== undefined) {
				logger.warn('Pagination is ignored when querying by id');
			}
		}

		const modelDefinition = getModelDefinition(modelConstructor);
		const keyFields = extractPrimaryKeyFieldNames(modelDefinition);

		let predicate: ModelPredicate<T>;

		if (isQueryOne(identifierOrCriteria)) {
			if (keyFields.length > 1) {
				const msg = errorMessages.queryByPkWithCompositeKeyPresent;
				logger.error(msg, { keyFields });

				throw new Error(msg);
			}

			predicate = ModelPredicateCreator.createForSingleField<T>(
				modelDefinition,
				keyFields[0],
				identifierOrCriteria
			);
		} else {
			// Object is being queried using object literal syntax
			if (isIdentifierObject(<T>identifierOrCriteria, modelDefinition)) {
				predicate = ModelPredicateCreator.createForPk<T>(
					modelDefinition,
					<T>identifierOrCriteria
				);
			} else if (isPredicatesAll(identifierOrCriteria)) {
				// Predicates.ALL means "all records", so no predicate (undefined)
				predicate = undefined;
			} else {
				predicate = ModelPredicateCreator.createFromExisting(
					modelDefinition,
					<any>identifierOrCriteria
				);
			}
		}

		const pagination = this.processPagination(
			modelDefinition,
			paginationProducer
		);

		//#endregion

		logger.debug('params ready', {
			modelConstructor,
			predicate: ModelPredicateCreator.getPredicates(predicate, false),
			pagination: {
				...pagination,
				sort: ModelSortPredicateCreator.getPredicates(
					pagination && pagination.sort,
					false
				),
			},
		});

		const result = await this.storage.query(
			modelConstructor,
			predicate,
			pagination
		);

		const returnOne =
			isQueryOne(identifierOrCriteria) ||
			isIdentifierObject(identifierOrCriteria, modelDefinition);

		return returnOne ? result[0] : result;
	};

	save = async <T extends PersistentModel>(
		model: T,
		condition?: ProducerModelPredicate<T>
	): Promise<T> => {
		await this.start();

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

		const producedCondition = ModelPredicateCreator.createFromExisting(
			modelDefinition,
			condition!
		);

		const [savedModel] = await this.storage.runExclusive(async s => {
			await s.save(model, producedCondition, undefined, patchesTuple);

			return s.query<T>(
				modelConstructor,
				ModelPredicateCreator.createForPk(modelDefinition, model)
			);
		});

		return savedModel;
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
			condition: ProducerModelPredicate<T> | typeof PredicateAll
		): Promise<T[]>;
		<T extends PersistentModel>(
			model: T,
			condition?: ProducerModelPredicate<T>
		): Promise<T>;
	} = async <T extends PersistentModel>(
		modelOrConstructor: T | PersistentModelConstructor<T>,
		identifierOrCriteria?:
			| IdentifierFieldOrIdentifierObject<T, PersistentModelMetaData<T>>
			| ProducerModelPredicate<T>
			| typeof PredicateAll
	): Promise<T | T[]> => {
		await this.start();

		let condition: ModelPredicate<T>;

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

			if (typeof identifierOrCriteria === 'string') {
				const keyFields = extractPrimaryKeyFieldNames(modelDefinition);

				if (keyFields.length > 1) {
					const msg = errorMessages.deleteByPkWithCompositeKeyPresent;
					logger.error(msg, { keyFields });

					throw new Error(msg);
				}

				condition = ModelPredicateCreator.createForSingleField<T>(
					getModelDefinition(modelConstructor),
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
					condition = ModelPredicateCreator.createFromExisting(
						modelDefinition,
						/**
						 * idOrCriteria is always a ProducerModelPredicate<T>, never a symbol.
						 * The symbol is used only for typing purposes. e.g. see Predicates.ALL
						 */
						identifierOrCriteria as ProducerModelPredicate<T>
					);
				}

				if (!condition || !ModelPredicateCreator.isValidPredicate(condition)) {
					const msg =
						'Criteria required. Do you want to delete all? Pass Predicates.ALL';
					logger.error(msg, { condition });

					throw new Error(msg);
				}
			}

			const [deleted] = await this.storage.delete(modelConstructor, condition);

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

				condition = (<ProducerModelPredicate<T>>identifierOrCriteria)(
					pkPredicate
				);
			} else {
				condition = pkPredicate;
			}

			const [[deleted]] = await this.storage.delete(model, condition);

			return deleted;
		}
	};

	observe: {
		(): Observable<SubscriptionMessage<PersistentModel>>;

		<T extends PersistentModel>(
			modelConstructor: PersistentModelConstructor<T>,
			identifier: string
		): Observable<SubscriptionMessage<T>>;

		<T extends PersistentModel>(
			modelConstructor: PersistentModelConstructor<T>,
			criteria?: ProducerModelPredicate<T> | typeof PredicateAll
		): Observable<SubscriptionMessage<T>>;

		<T extends PersistentModel>(model: T): Observable<SubscriptionMessage<T>>;
	} = <T extends PersistentModel>(
		modelOrConstructor?: T | PersistentModelConstructor<T>,
		identifierOrCriteria?:
			| string
			| ProducerModelPredicate<T>
			| typeof PredicateAll
	): Observable<SubscriptionMessage<T>> => {
		let predicate: ModelPredicate<T>;

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
				getModelDefinition(modelConstructor)
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

		if (typeof identifierOrCriteria === 'string') {
			const modelDefinition = getModelDefinition(modelConstructor);
			const [keyField] = extractPrimaryKeyFieldNames(modelDefinition);

			predicate = ModelPredicateCreator.createForSingleField<T>(
				getModelDefinition(modelConstructor),
				keyField,
				identifierOrCriteria
			);
		} else {
			if (isPredicatesAll(identifierOrCriteria)) {
				predicate = undefined;
			} else {
				predicate =
					modelConstructor &&
					ModelPredicateCreator.createFromExisting<T>(
						getModelDefinition(modelConstructor),
						identifierOrCriteria
					);
			}
		}

		return new Observable<SubscriptionMessage<T>>(observer => {
			let handle: ZenObservable.Subscription;

			(async () => {
				await this.start();

				// Filter the events returned by Storage according to namespace,
				// append original element data, and subscribe to the observable
				handle = this.storage
					.observe(modelConstructor, predicate)
					.filter(({ model }) => namespaceResolver(model) === USER)
					.subscribe({
						next: async item => {
							// the `element` doesn't necessarily contain all item details or
							// have related records attached consistently with that of a query()
							// result item. for consistency, we attach them here.

							let message = item;

							// as long as we're not dealing with a DELETE, we need to fetch a fresh
							// item from storage to ensure it's fully populated.
							if (item.opType !== 'DELETE') {
								const modelDefinition = getModelDefinition(item.model);
								const keyFields = extractPrimaryKeyFieldNames(modelDefinition);
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

							observer.next(message as SubscriptionMessage<T>);
						},
						error: err => observer.error(err),
						complete: () => observer.complete(),
					});
			})();

			return () => {
				if (handle) {
					handle.unsubscribe();
				}
			};
		});
	};

	observeQuery: {
		<T extends PersistentModel>(
			modelConstructor: PersistentModelConstructor<T>,
			criteria?: ProducerModelPredicate<T> | typeof PredicateAll,
			paginationProducer?: ObserveQueryOptions<T>
		): Observable<DataStoreSnapshot<T>>;
	} = <T extends PersistentModel>(
		model: PersistentModelConstructor<T>,
		criteria?: ProducerModelPredicate<T> | typeof PredicateAll,
		options?: ObserveQueryOptions<T>
	): Observable<DataStoreSnapshot<T>> => {
		return new Observable<DataStoreSnapshot<T>>(observer => {
			const items = new Map<string, T>();
			const itemsChanged = new Map<string, T>();
			let deletedItemIds: string[] = [];
			let handle: ZenObservable.Subscription;
			let predicate: ModelPredicate<T>;

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
			const keyFields = extractPrimaryKeyFieldNames(modelDefinition);

			if (isQueryOne(criteria)) {
				predicate = ModelPredicateCreator.createForSingleField<T>(
					modelDefinition,
					keyFields[0],
					criteria
				);
			} else {
				if (isPredicatesAll(criteria)) {
					// Predicates.ALL means "all records", so no predicate (undefined)
					predicate = undefined;
				} else {
					predicate = ModelPredicateCreator.createFromExisting(
						modelDefinition,
						criteria
					);
				}
			}

			const { predicates, type: predicateGroupType } =
				ModelPredicateCreator.getPredicates(predicate, false) || {};
			const hasPredicate = !!predicates;

			(async () => {
				try {
					// first, query and return any locally-available records
					(await this.query(model, criteria, sortOptions)).forEach(item => {
						const itemModelDefinition = getModelDefinition(model);
						const idOrPk = getIdentifierValue(itemModelDefinition, item);
						items.set(idOrPk, item);
					});

					// Observe the model and send a stream of updates (debounced).
					// We need to post-filter results instead of passing criteria through
					// to have visibility into items that move from in-set to out-of-set.
					// We need to explicitly remove those items from the existing snapshot.
					handle = this.observe(model).subscribe(
						({ element, model, opType }) => {
							const itemModelDefinition = getModelDefinition(model);
							const idOrPk = getIdentifierValue(itemModelDefinition, element);
							if (
								hasPredicate &&
								!validatePredicate(element, predicateGroupType, predicates)
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

							const isSynced = this.sync?.getModelSyncedStatus(model) ?? false;

							const limit =
								itemsChanged.size - deletedItemIds.length >= this.syncPageSize;

							if (limit || isSynced) {
								limitTimerRace.resolve();
							}

							// kicks off every subsequent race as results sync down
							limitTimerRace.start();
						}
					);

					// returns a set of initial/locally-available results
					generateAndEmitSnapshot();
				} catch (err) {
					observer.error(err);
				}
			})();

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
					const idOrPk = getIdentifierValue(itemModelDefinition, item);
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
				// send the generated snapshot to the primary subscription
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
				const pagination = this.processPagination(modelDefinition, options);

				const sortPredicates = ModelSortPredicateCreator.getPredicates(
					pagination.sort
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
					Hub.remove('api', hubCallback);
				}
			};
			Hub.listen('datastore', hubCallback);

			return () => {
				if (handle) {
					handle.unsubscribe();
				}
			};
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

	clear = async function clear() {
		checkSchemaInitialized();
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

		await this.storage.clear();

		if (this.sync) {
			this.sync.unsubscribeConnectivity();
		}

		this.initialized = undefined; // Should re-initialize when start() is called.
		this.storage = undefined;
		this.sync = undefined;
		this.syncPredicates = new WeakMap<SchemaModel, ModelPredicate<any>>();
	};

	stop = async function stop(this: InstanceType<typeof DataStore>) {
		if (this.initialized !== undefined) {
			await this.start();
		}

		if (syncSubscription && !syncSubscription.closed) {
			syncSubscription.unsubscribe();
		}

		if (this.sync) {
			this.sync.unsubscribeConnectivity();
		}

		this.initialized = undefined; // Should re-initialize when start() is called.
		this.sync = undefined;
	};

	private processPagination<T extends PersistentModel>(
		modelDefinition: SchemaModel,
		paginationProducer: ProducerPaginationInput<T>
	): PaginationInput<T> | undefined {
		let sortPredicate: SortPredicate<T>;
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
				paginationProducer.sort
			);
		}

		return {
			limit,
			page,
			sort: sortPredicate,
		};
	}

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
					const modelDefinition = getModelDefinition(modelConstructor);

					// conditionProducer is either a predicate, e.g. (c) => c.field('eq', 1)
					// OR a function/promise that returns a predicate
					const condition = await this.unwrapPromise(conditionProducer);
					if (isPredicatesAll(condition)) {
						return [modelDefinition, null];
					}

					const predicate = this.createFromCondition(
						modelDefinition,
						condition
					);

					return [modelDefinition, predicate];
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
	): Promise<ProducerModelPredicate<T>> {
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

	// database separation for Amplify Console. Not a public API
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
