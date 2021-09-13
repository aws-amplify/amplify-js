import { Amplify, ConsoleLogger as Logger, Hub, JS } from '@aws-amplify/core';
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
} from '../types';
import {
	DATASTORE,
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
} from '../util';

setAutoFreeze(true);
enablePatches();

const logger = new Logger('DataStore');

const ulid = monotonicUlidFactory(Date.now());
const { isNode } = JS.browserOrNode();

declare class Setting {
	constructor(init: ModelInit<Setting>);
	static copyOf(
		src: Setting,
		mutator: (draft: MutableModel<Setting>) => void | Setting
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

const instancesMetadata = new WeakSet<
	ModelInit<PersistentModel & Partial<ModelInstanceMetadata>>
>();
function modelInstanceCreator<T extends PersistentModel = PersistentModel>(
	modelConstructor: PersistentModelConstructor<T>,
	init: ModelInit<T> & Partial<ModelInstanceMetadata>
): T {
	instancesMetadata.add(init);

	return <T>new modelConstructor(init);
}

const validateModelFields = (modelDefinition: SchemaModel | SchemaNonModel) => (
	k: string,
	v: any
) => {
	const fieldDefinition = modelDefinition.fields[k];

	if (fieldDefinition !== undefined) {
		const {
			type,
			isRequired,
			isArrayNullable,
			name,
			isArray,
		} = fieldDefinition;

		if (
			((!isArray && isRequired) || (isArray && !isArrayNullable)) &&
			(v === null || v === undefined)
		) {
			throw new Error(`Field ${name} is required`);
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

const initializeInstance = <T>(
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

					// instancesIds are set by modelInstanceCreator, it is accessible only internally
					const isInternal = _id !== null && _id !== undefined;

					const id = isInternal
						? _id
						: modelDefinition.syncable
						? uuid4()
						: ulid();

					if (!isInternal) {
						checkReadOnlyPropertyOnCreate(draft, modelDefinition);
					}

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

			let patches;
			const model = produce(
				source,
				draft => {
					fn(<MutableModel<T>>(draft as unknown));
					draft.id = source.id;
					const modelValidator = validateModelFields(modelDefinition);
					Object.entries(draft).forEach(([k, v]) => {
						const parsedValue = castInstanceType(modelDefinition, k, v);

						modelValidator(k, parsedValue);
					});
				},
				p => (patches = p)
			);

			if (patches.length) {
				modelPatchesMap.set(model, [patches, source]);
				checkReadOnlyPropertyOnUpdate(patches, modelDefinition);
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

const createNonModelClass = <T>(typeDefinition: SchemaNonModel) => {
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

function defaultErrorHandler(error: SyncError) {
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
	const Setting = dataStoreClasses.Setting as PersistentModelConstructor<
		Setting
	>;

	const modelDefinition = schema.namespaces[DATASTORE].models.Setting;

	await storage.runExclusive(async s => {
		const [schemaVersionSetting] = await s.query(
			Setting,
			ModelPredicateCreator.createFromExisting(modelDefinition, c =>
				// @ts-ignore Argument of type '"eq"' is not assignable to parameter of type 'never'.
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
	private amplifyConfig: Record<string, any> = {};
	private authModeStrategy: AuthModeStrategy;
	private conflictHandler: ConflictHandler;
	private errorHandler: (error: SyncError) => void;
	private fullSyncInterval: number;
	private initialized: Promise<void>;
	private initReject: Function;
	private initResolve: Function;
	private maxRecordsToSync: number;
	private storage: Storage;
	private sync: SyncEngine;
	private syncPageSize: number;
	private syncExpressions: SyncExpression[];
	private syncPredicates: WeakMap<
		SchemaModel,
		ModelPredicate<any>
	> = new WeakMap<SchemaModel, ModelPredicate<any>>();
	private sessionId: string;
	private storageAdapter: Adapter;

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
				this.maxRecordsToSync,
				this.syncPageSize,
				this.conflictHandler,
				this.errorHandler,
				this.syncPredicates,
				this.amplifyConfig,
				this.authModeStrategy
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
			id: string
		): Promise<T | undefined>;
		<T extends PersistentModel>(
			modelConstructor: PersistentModelConstructor<T>,
			criteria?: ProducerModelPredicate<T> | typeof PredicateAll,
			paginationProducer?: ProducerPaginationInput<T>
		): Promise<T[]>;
	} = async <T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		idOrCriteria?: string | ProducerModelPredicate<T> | typeof PredicateAll,
		paginationProducer?: ProducerPaginationInput<T>
	): Promise<T | T[] | undefined> => {
		await this.start();

		//#region Input validation

		if (!isValidModelConstructor(modelConstructor)) {
			const msg = 'Constructor is not for a valid model';
			logger.error(msg, { modelConstructor });

			throw new Error(msg);
		}

		if (typeof idOrCriteria === 'string') {
			if (paginationProducer !== undefined) {
				logger.warn('Pagination is ignored when querying by id');
			}
		}

		const modelDefinition = getModelDefinition(modelConstructor);
		let predicate: ModelPredicate<T>;

		if (isQueryOne(idOrCriteria)) {
			predicate = ModelPredicateCreator.createForId<T>(
				modelDefinition,
				idOrCriteria
			);
		} else {
			if (isPredicatesAll(idOrCriteria)) {
				// Predicates.ALL means "all records", so no predicate (undefined)
				predicate = undefined;
			} else {
				predicate = ModelPredicateCreator.createFromExisting(
					modelDefinition,
					idOrCriteria
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

		return isQueryOne(idOrCriteria) ? result[0] : result;
	};

	save = async <T extends PersistentModel>(
		model: T,
		condition?: ProducerModelPredicate<T>
	): Promise<T> => {
		await this.start();

		// Immer patches for constructing a correct update mutation input
		// Allows us to only include changed fields for updates
		const patchesTuple = modelPatchesMap.get(model);

		const modelConstructor: PersistentModelConstructor<T> = model
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
			condition
		);

		const [savedModel] = await this.storage.runExclusive(async s => {
			await s.save(model, producedCondition, undefined, patchesTuple);

			return s.query(
				modelConstructor,
				ModelPredicateCreator.createForId(modelDefinition, model.id)
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
			model: T,
			condition?: ProducerModelPredicate<T>
		): Promise<T>;
		<T extends PersistentModel>(
			modelConstructor: PersistentModelConstructor<T>,
			id: string
		): Promise<T[]>;
		<T extends PersistentModel>(
			modelConstructor: PersistentModelConstructor<T>,
			condition: ProducerModelPredicate<T> | typeof PredicateAll
		): Promise<T[]>;
	} = async <T extends PersistentModel>(
		modelOrConstructor: T | PersistentModelConstructor<T>,
		idOrCriteria?: string | ProducerModelPredicate<T> | typeof PredicateAll
	) => {
		await this.start();

		let condition: ModelPredicate<T>;

		if (!modelOrConstructor) {
			const msg = 'Model or Model Constructor required';
			logger.error(msg, { modelOrConstructor });

			throw new Error(msg);
		}

		if (isValidModelConstructor(modelOrConstructor)) {
			const modelConstructor = modelOrConstructor;

			if (!idOrCriteria) {
				const msg =
					'Id to delete or criteria required. Do you want to delete all? Pass Predicates.ALL';
				logger.error(msg, { idOrCriteria });

				throw new Error(msg);
			}

			if (typeof idOrCriteria === 'string') {
				condition = ModelPredicateCreator.createForId<T>(
					getModelDefinition(modelConstructor),
					idOrCriteria
				);
			} else {
				condition = ModelPredicateCreator.createFromExisting(
					getModelDefinition(modelConstructor),
					/**
					 * idOrCriteria is always a ProducerModelPredicate<T>, never a symbol.
					 * The symbol is used only for typing purposes. e.g. see Predicates.ALL
					 */
					idOrCriteria as ProducerModelPredicate<T>
				);

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

			const idPredicate = ModelPredicateCreator.createForId<T>(
				modelDefinition,
				model.id
			);

			if (idOrCriteria) {
				if (typeof idOrCriteria !== 'function') {
					const msg = 'Invalid criteria';
					logger.error(msg, { idOrCriteria });

					throw new Error(msg);
				}

				condition = idOrCriteria(idPredicate);
			} else {
				condition = idPredicate;
			}

			const [[deleted]] = await this.storage.delete(model, condition);

			return deleted;
		}
	};

	observe: {
		(): Observable<SubscriptionMessage<PersistentModel>>;

		<T extends PersistentModel>(model: T): Observable<SubscriptionMessage<T>>;

		<T extends PersistentModel>(
			modelConstructor: PersistentModelConstructor<T>,
			criteria?: string | ProducerModelPredicate<T>
		): Observable<SubscriptionMessage<T>>;
	} = <T extends PersistentModel = PersistentModel>(
		modelOrConstructor?: T | PersistentModelConstructor<T>,
		idOrCriteria?: string | ProducerModelPredicate<T>
	): Observable<SubscriptionMessage<T>> => {
		let predicate: ModelPredicate<T>;

		const modelConstructor: PersistentModelConstructor<T> =
			modelOrConstructor && isValidModelConstructor(modelOrConstructor)
				? modelOrConstructor
				: undefined;

		if (modelOrConstructor && modelConstructor === undefined) {
			const model = <T>modelOrConstructor;
			const modelConstructor =
				model && (<Object>Object.getPrototypeOf(model)).constructor;

			if (isValidModelConstructor<T>(modelConstructor)) {
				if (idOrCriteria) {
					logger.warn('idOrCriteria is ignored when using a model instance', {
						model,
						idOrCriteria,
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

		if (idOrCriteria !== undefined && modelConstructor === undefined) {
			const msg = 'Cannot provide criteria without a modelConstructor';
			logger.error(msg, idOrCriteria);
			throw new Error(msg);
		}

		if (modelConstructor && !isValidModelConstructor(modelConstructor)) {
			const msg = 'Constructor is not for a valid model';
			logger.error(msg, { modelConstructor });

			throw new Error(msg);
		}

		if (typeof idOrCriteria === 'string') {
			predicate = ModelPredicateCreator.createForId<T>(
				getModelDefinition(modelConstructor),
				idOrCriteria
			);
		} else {
			predicate =
				modelConstructor &&
				ModelPredicateCreator.createFromExisting<T>(
					getModelDefinition(modelConstructor),
					idOrCriteria
				);
		}

		return new Observable<SubscriptionMessage<T>>(observer => {
			let handle: ZenObservable.Subscription;

			(async () => {
				await this.start();

				handle = this.storage
					.observe(modelConstructor, predicate)
					.filter(({ model }) => namespaceResolver(model) === USER)
					.subscribe(observer);
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
			paginationProducer?: ProducerPaginationInput<T>
		): Observable<DataStoreSnapshot<T>>;
	} = <T extends PersistentModel = PersistentModel>(
		model: PersistentModelConstructor<T>,
		criteria?: ProducerModelPredicate<T> | typeof PredicateAll,
		options?: ProducerPaginationInput<T>
	): Observable<DataStoreSnapshot<T>> => {
		const SYNCED_ITEMS_THRESHOLD = this.syncPageSize || 1000;

		return new Observable<DataStoreSnapshot<T>>(observer => {
			let itemsChanged = new Map<string, T>();
			let items = new Map<string, T>();

			// first, query and return any locally available records
			(async () => {
				try {
					// using a Map to maintain insertion order
					items = new Map(
						(await this.query(model, criteria, options)).map(x => [x.id, x])
					);
					onQueryComplete();
				} catch (err) {
					observer.error(err);
				}
			})();

			// callback for sending snapshots and resetting 'itemsChanged'
			const onQueryComplete = () => {
				const isSynced = this.sync.getModelSyncedStatus(model);

				items = new Map([
					...Array.from(items.entries()),
					...Array.from(itemsChanged.entries()),
				]);
				const snapshot: DataStoreSnapshot<T> = {
					items: Array.from(items.values()),
					isSynced,
					itemsChanged: Array.from(itemsChanged.values()),
				};
				observer.next(snapshot);
				itemsChanged = new Map();
			};

			const hubCallback = async hubData => {
				const { event, data } = hubData.payload;
				if (
					event === ControlMessage.SYNC_ENGINE_MODEL_SYNCED &&
					data?.model?.name === model.name
				) {
					onQueryComplete();
					Hub.remove('api', hubCallback);
				}
			};

			Hub.listen('datastore', hubCallback);

			// observe the model and send a stream of updates (debounced)
			const handle: ZenObservable.Subscription = this.observe(
				model,
				// @ts-ignore TODO: fix this TSlint error
				criteria
			).subscribe(({ condition, element, model, opType }) => {
				itemsChanged.set(element.id, element);

				const isSynced = this.sync.getModelSyncedStatus(model);

				if (itemsChanged.size >= SYNCED_ITEMS_THRESHOLD || isSynced) {
					onQueryComplete();
				}
			});

			// cleanup function called with '.unsubscribe()'
			return () => {
				if (handle) {
					handle.unsubscribe();
					const isSynced = this.sync.getModelSyncedStatus(model);
					const snapshot: DataStoreSnapshot<T> = {
						items: Array.from(items.values()),
						isSynced,
						itemsChanged: Array.from(itemsChanged.values()),
					};
					observer.next(snapshot);
				}
			};
		});
	};

	configure = (config: DataStoreConfig = {}) => {
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

		this.amplifyConfig = { ...configFromAmplify, ...this.amplifyConfig };

		this.conflictHandler = this.setConflictHandler(config);
		this.errorHandler = this.setErrorHandler(config);

		const authModeStrategyType =
			(configDataStore && configDataStore.authModeStrategyType) ||
			configAuthModeStrategyType ||
			AuthModeStrategyType.DEFAULT;

		switch (authModeStrategyType) {
			case AuthModeStrategyType.MULTI_AUTH:
				this.authModeStrategy = multiAuthStrategy;
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
			this.syncExpressions ||
			configSyncExpressions;

		this.maxRecordsToSync =
			(configDataStore && configDataStore.maxRecordsToSync) ||
			this.maxRecordsToSync ||
			configMaxRecordsToSync;

		this.syncPageSize =
			(configDataStore && configDataStore.syncPageSize) ||
			this.syncPageSize ||
			configSyncPageSize;

		this.fullSyncInterval =
			(configDataStore && configDataStore.fullSyncInterval) ||
			this.fullSyncInterval ||
			configFullSyncInterval ||
			24 * 60; // 1 day

		this.storageAdapter =
			(configDataStore && configDataStore.storageAdapter) ||
			this.storageAdapter ||
			configStorageAdapter ||
			undefined;

		this.sessionId = this.retrieveSessionId();
	};

	clear = async function clear() {
		if (this.storage === undefined) {
			return;
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

	stop = async function stop() {
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
		} catch {
			return undefined;
		}
	}
}

const instance = new DataStore();
Amplify.register(instance);

export { DataStore as DataStoreClass, initSchema, instance as DataStore };
