import { Amplify, ConsoleLogger as Logger, Hub } from '@aws-amplify/core';
import { Draft, immerable, produce, setAutoFreeze } from 'immer';
import { v4 as uuid4 } from 'uuid';
import Observable, { ZenObservable } from 'zen-observable-ts';
import {
	isPredicatesAll,
	ModelPredicateCreator,
	PredicateAll,
} from '../predicates';
import { ExclusiveStorage as Storage } from '../storage/storage';
import { ControlMessage, SyncEngine } from '../sync';
import {
	ConflictHandler,
	DataStoreConfig,
	GraphQLScalarType,
	InternalSchema,
	isGraphQLScalarType,
	ModelFieldType,
	ModelInit,
	ModelInstanceMetadata,
	ModelPredicate,
	MutableModel,
	NamespaceResolver,
	NonModelTypeConstructor,
	PaginationInput,
	PersistentModel,
	PersistentModelConstructor,
	ProducerModelPredicate,
	Schema,
	SchemaModel,
	SchemaNamespace,
	SchemaNonModel,
	SubscriptionMessage,
	SyncConflict,
	SyncError,
	TypeConstructorMap,
	ErrorHandler,
} from '../types';
import {
	DATASTORE,
	establishRelation,
	exhaustiveCheck,
	isModelConstructor,
	monotonicUlidFactory,
	NAMESPACES,
	STORAGE,
	SYNC,
	USER,
} from '../util';

setAutoFreeze(true);

const logger = new Logger('DataStore');

const ulid = monotonicUlidFactory(Date.now());

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

let storage: Storage;
let schema: InternalSchema;
const modelNamespaceMap = new WeakMap<
	PersistentModelConstructor<any>,
	string
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

let dataStoreClasses: TypeConstructorMap;

let userClasses: TypeConstructorMap;

let syncClasses: TypeConstructorMap;

let storageClasses: TypeConstructorMap;

const initSchema = (userSchema: Schema) => {
	if (schema !== undefined) {
		throw new Error('The schema has already been initialized');
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
		schema.namespaces[namespace].relationships = establishRelation(
			schema.namespaces[namespace]
		);

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
		const { type, isRequired, name, isArray } = fieldDefinition;

		if (isRequired && (v === null || v === undefined)) {
			throw new Error(`Field ${name} is required`);
		}

		if (isGraphQLScalarType(type)) {
			const jsType = GraphQLScalarType.getJSType(type);

			if (isArray) {
				if (!Array.isArray(v)) {
					throw new Error(
						`Field ${name} should be of type ${jsType}[], ${typeof v} received. ${v}`
					);
				}

				if ((<[]>v).some(e => typeof e !== jsType)) {
					const elemTypes = (<[]>v).map(e => typeof e).join(',');

					throw new Error(
						`All elements in the ${name} array should be of type ${jsType}, [${elemTypes}] received. ${v}`
					);
				}
			} else if (typeof v !== jsType && v !== null) {
				throw new Error(
					`Field ${name} should be of type ${jsType}, ${typeof v} received. ${v}`
				);
			}
		}
	}
};

const initializeInstance = <T>(
	init: ModelInit<T>,
	modelDefinition: SchemaModel | SchemaNonModel,
	draft: Draft<T & ModelInstanceMetadata>
) => {
	const modelValidator = validateModelFields(modelDefinition);
	Object.entries(init).forEach(([k, v]) => {
		modelValidator(k, v);
		(<any>draft)[k] = v;
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
				const modelValidator = validateModelFields(modelDefinition);
				Object.entries(draft).forEach(([k, v]) => {
					modelValidator(k, v);
				});
			});
		}
	});

	clazz[immerable] = true;

	Object.defineProperty(clazz, 'name', { value: modelDefinition.name });

	return clazz;
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

	return clazz;
};

const save = async <T extends PersistentModel>(
	model: T,
	condition?: ProducerModelPredicate<T>
): Promise<T> => {
	await start();

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

	const [savedModel] = await storage.runExclusive(async s => {
		await s.save(model, producedCondition);

		return s.query(
			modelConstructor,
			ModelPredicateCreator.createForId(modelDefinition, model.id)
		);
	});

	return savedModel;
};

const remove: {
	<T extends PersistentModel>(
		model: T,
		condition?: ProducerModelPredicate<T>
	): Promise<T>;
	<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		id: string
	): Promise<T>;
	<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		condition: ProducerModelPredicate<T> | typeof PredicateAll
	): Promise<T[]>;
} = async <T extends PersistentModel>(
	modelOrConstructor: T | PersistentModelConstructor<T>,
	idOrCriteria?: string | ProducerModelPredicate<T> | typeof PredicateAll
) => {
	await start();

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

		const [deleted] = await storage.delete(modelConstructor, condition);

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

		const [[deleted]] = await storage.delete(model, condition);

		return deleted;
	}
};
const observe: {
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

			return observe(modelConstructor, model.id);
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
			await start();

			handle = storage
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

function isQueryOne(obj: any): obj is string {
	return typeof obj === 'string';
}

const query: {
	<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		id: string
	): Promise<T | undefined>;
	<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		criteria?: ProducerModelPredicate<T> | typeof PredicateAll,
		pagination?: PaginationInput
	): Promise<T[]>;
} = async <T extends PersistentModel>(
	modelConstructor: PersistentModelConstructor<T>,
	idOrCriteria?: string | ProducerModelPredicate<T> | typeof PredicateAll,
	pagination?: PaginationInput
): Promise<T | T[] | undefined> => {
	await start();

	//#region Input validation

	if (!isValidModelConstructor(modelConstructor)) {
		const msg = 'Constructor is not for a valid model';
		logger.error(msg, { modelConstructor });

		throw new Error(msg);
	}

	if (typeof idOrCriteria === 'string') {
		if (pagination !== undefined) {
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

	const { limit, page } = pagination || {};

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

	//#endregion

	logger.debug('params ready', {
		modelConstructor,
		predicate: ModelPredicateCreator.getPredicates(predicate, false),
		pagination,
	});

	const result = await storage.query(modelConstructor, predicate, pagination);

	return isQueryOne(idOrCriteria) ? result[0] : result;
};

let sync: SyncEngine;
let amplifyConfig: Record<string, any> = {};
let conflictHandler: ConflictHandler;
let errorHandler: (error: SyncError) => void;
let maxRecordsToSync: number;
let syncPageSize: number;
let fullSyncInterval: number;

function configure(config: DataStoreConfig = {}) {
	const {
		DataStore: configDataStore,
		conflictHandler: configConflictHandler,
		errorHandler: configErrorHandler,
		maxRecordsToSync: configMaxRecordsToSync,
		syncPageSize: configSyncPageSize,
		fullSyncInterval: configFullSyncInterval,
		...configFromAmplify
	} = config;

	amplifyConfig = { ...configFromAmplify, ...amplifyConfig };

	conflictHandler = setConflictHandler(config);
	errorHandler = setErrorHandler(config);

	maxRecordsToSync =
		(configDataStore && configDataStore.maxRecordsToSync) ||
		maxRecordsToSync ||
		config.maxRecordsToSync;

	syncPageSize =
		(configDataStore && configDataStore.syncPageSize) ||
		syncPageSize ||
		config.syncPageSize;

	fullSyncInterval =
		(configDataStore && configDataStore.fullSyncInterval) ||
		configFullSyncInterval ||
		config.fullSyncInterval ||
		24 * 60; // 1 day
}

function defaultConflictHandler(conflictData: SyncConflict): PersistentModel {
	const { localModel, modelConstructor, remoteModel } = conflictData;
	const { _version } = remoteModel;
	return modelInstanceCreator(modelConstructor, { ...localModel, _version });
}

function setConflictHandler(config: DataStoreConfig): ConflictHandler {
	const { DataStore: configDataStore } = config;

	const conflictHandlerIsDefault: () => boolean = () =>
		conflictHandler === defaultConflictHandler;

	if (configDataStore) {
		return configDataStore.conflictHandler;
	}
	if (conflictHandlerIsDefault() && config.conflictHandler) {
		return config.conflictHandler;
	}

	return conflictHandler || defaultConflictHandler;
}

function setErrorHandler(config: DataStoreConfig): ErrorHandler {
	const { DataStore: configDataStore } = config;

	const errorHandlerIsDefault: () => boolean = () =>
		errorHandler === defaultErrorHandler;

	if (configDataStore) {
		return configDataStore.errorHandler;
	}
	if (errorHandlerIsDefault() && config.errorHandler) {
		return config.errorHandler;
	}

	return errorHandler || defaultErrorHandler;
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
				c.key('eq', SETTING_SCHEMA_VERSION)
			),
			{ page: 0, limit: 1 }
		);

		if (schemaVersionSetting !== undefined) {
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

let initResolve: Function;
let initReject: Function;
let initialized: Promise<void>;
async function start(): Promise<void> {
	if (initialized === undefined) {
		logger.debug('Starting DataStore');
		initialized = new Promise((res, rej) => {
			initResolve = res;
			initReject = rej;
		});
	} else {
		await initialized;

		return;
	}

	storage = new Storage(
		schema,
		namespaceResolver,
		getModelConstructorByModelName,
		modelInstanceCreator
	);

	await storage.init();

	await checkSchemaVersion(storage, schema.version);

	const { aws_appsync_graphqlEndpoint } = amplifyConfig;

	if (aws_appsync_graphqlEndpoint) {
		logger.debug('GraphQL endpoint available', aws_appsync_graphqlEndpoint);

		sync = new SyncEngine(
			schema,
			namespaceResolver,
			syncClasses,
			userClasses,
			storage,
			modelInstanceCreator,
			maxRecordsToSync,
			syncPageSize,
			conflictHandler,
			errorHandler
		);

		const fullSyncIntervalInMilliseconds = fullSyncInterval * 1000 * 60; // fullSyncInterval from param is in minutes
		syncSubscription = sync
			.start({ fullSyncInterval: fullSyncIntervalInMilliseconds })
			.subscribe({
				next: ({ type, data }) => {
					if (type === ControlMessage.SYNC_ENGINE_STORAGE_SUBSCRIBED) {
						initResolve();
					}

					Hub.dispatch('datastore', {
						event: type,
						data,
					});
				},
				error: err => {
					logger.warn('Sync error', err);
					initReject();
				},
			});
	} else {
		logger.warn("Data won't be synchronized. No GraphQL endpoint configured. Did you forget `Amplify.configure(awsconfig)`?", {
			config: amplifyConfig,
		});

		initResolve();
	}

	await initialized;
}

async function clear() {
	if (storage === undefined) {
		return;
	}

	if (syncSubscription && !syncSubscription.closed) {
		syncSubscription.unsubscribe();
	}

	await storage.clear();

	initialized = undefined; // Should re-initialize when start() is called.
	storage = undefined;
	sync = undefined;
}

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
	constructor() {
		Amplify.register(this);
	}
	getModuleName() {
		return 'DataStore';
	}
	start = start;
	query = query;
	save = save;
	delete = remove;
	observe = observe;
	configure = configure;
	clear = clear;
}

const instance = new DataStore();

export { initSchema, instance as DataStore };
