import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { Draft, immerable, produce, setAutoFreeze } from 'immer';
import { v1 as uuid1, v4 as uuid4 } from 'uuid';
import Observable from 'zen-observable-ts';
import { isPredicatesAll, ModelPredicateCreator } from '../predicates';
import Storage from '../storage/storage';
import { SyncEngine } from '../sync';
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
	PaginationInput,
	PersistentModel,
	PersistentModelConstructor,
	ProducerModelPredicate,
	Schema,
	SchemaModel,
	SchemaNamespace,
	SubscriptionMessage,
	SyncConflict,
	SyncError,
} from '../types';
import {
	DATASTORE,
	establishRelation,
	exhaustiveCheck,
	isModelConstructor,
	NAMESPACES,
	STORAGE,
	SYNC,
	USER,
} from '../util';

setAutoFreeze(true);

const logger = new Logger('DataStore');

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
const classNamespaceMap = new WeakMap<
	PersistentModelConstructor<any>,
	string
>();

const getModelDefinition = (
	modelConstructor: PersistentModelConstructor<any>
) => {
	const namespace = classNamespaceMap.get(modelConstructor);

	return schema.namespaces[namespace].models[modelConstructor.name];
};

const isValidModelConstructor = <T extends PersistentModel>(
	obj: any
): obj is PersistentModelConstructor<T> => {
	return isModelConstructor(obj) && classNamespaceMap.has(obj);
};

const namespaceResolver: NamespaceResolver = modelConstructor =>
	classNamespaceMap.get(modelConstructor);

let dataStoreClasses: {
	[modelName: string]: PersistentModelConstructor<any>;
};

let userClasses: {
	[modelName: string]: PersistentModelConstructor<any>;
};

let syncClasses: {
	[modelName: string]: PersistentModelConstructor<any>;
};

let storageClasses: {
	[modelName: string]: PersistentModelConstructor<any>;
};

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
	userClasses = createModelClassses(internalUserNamespace);
	logger.log('DataStore', 'Models initialized');

	const dataStoreNamespace = getNamespace();
	const storageNamespace = Storage.getNamespace();
	const syncNamespace = SyncEngine.getNamespace();

	dataStoreClasses = createModelClassses(dataStoreNamespace);
	storageClasses = createModelClassses(storageNamespace);
	syncClasses = createModelClassses(syncNamespace);

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
			const wea: string[] = [];

			Object.values(model.fields)
				.filter(
					field =>
						field.association &&
						field.association.connectionType === 'BELONGS_TO' &&
						(<ModelFieldType>field.type).model !== model.name
				)
				.forEach(field => wea.push((<ModelFieldType>field.type).model));

			modelAssociations.set(model.name, wea);
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

const createModelClassses: (
	namespace: SchemaNamespace
) => {
	[modelName: string]: PersistentModelConstructor<any>;
} = namespace => {
	const classes: {
		[modelName: string]: PersistentModelConstructor<any>;
	} = {};

	Object.entries(namespace.models).forEach(([modelName, modelDefinition]) => {
		const clazz = createModelClass(modelDefinition);
		classes[modelName] = clazz;

		classNamespaceMap.set(clazz, namespace.name);
	});

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

const createModelClass = <T extends PersistentModel>(
	modelDefinition: SchemaModel
) => {
	const clazz = <PersistentModelConstructor<T>>(<unknown>class Model {
		constructor(init: ModelInit<T>) {
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
					: // Transform UUID v1 into a lexicographically sortable string
					  uuid1().replace(/^(.{8})-(.{4})-(.{4})/, '$3-$2-$1');

			const instance = produce(
				this,
				(draft: Draft<T & ModelInstanceMetadata>) => {
					Object.entries(init).forEach(([k, v]) => {
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

						(<any>draft)[k] = v;
					});

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
			if (
				!isValidModelConstructor(
					Object.getPrototypeOf(source || {}).constructor
				)
			) {
				const msg = 'The source object is not a valid model';
				logger.error(msg, { source });

				throw new Error(msg);
			}

			return produce(source, draft => {
				fn(draft);
				draft.id = source.id;
			});
		}
	});

	clazz[immerable] = true;

	Object.defineProperty(clazz, 'name', { value: modelDefinition.name });

	return clazz;
};

const save = async <T extends PersistentModel>(
	model: T,
	condition?: ProducerModelPredicate<T>
) => {
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

	const savedModel = await storage.runExclusive(async s => {
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
		condition: ProducerModelPredicate<T>
	): Promise<T[]>;
} = async <T extends PersistentModel>(
	modelOrConstructor: T | PersistentModelConstructor<T>,
	idOrCriteria?: string | ProducerModelPredicate<T>
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
				idOrCriteria
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
	(): Observable<SubscriptionMessage<any>>;
	<T extends PersistentModel>(obj: T): Observable<SubscriptionMessage<T>>;
	<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		id: string
	): Observable<SubscriptionMessage<T>>;
	<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>
	): Observable<SubscriptionMessage<T>>;
	<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		criteria: ProducerModelPredicate<T>
	): Observable<SubscriptionMessage<T>>;
} = <T extends PersistentModel>(
	modelConstructor?: PersistentModelConstructor<T>,
	idOrCriteria?: string | ProducerModelPredicate<T>
) => {
	start();
	let predicate: ModelPredicate<T>;

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
			ModelPredicateCreator.createFromExisting(
				getModelDefinition(modelConstructor),
				idOrCriteria
			);
	}

	return storage
		.observe(modelConstructor, predicate)
		.filter(({ model }) => namespaceResolver(model) === USER);
};

const query: {
	<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		id: string
	): Promise<T | undefined>;
	<T extends PersistentModel>(
		modelConstructor: PersistentModelConstructor<T>,
		criteria?: ProducerModelPredicate<T>,
		pagination?: PaginationInput
	): Promise<T[]>;
} = async <T extends PersistentModel>(
	modelConstructor: PersistentModelConstructor<T>,
	idOrCriteria?: string | ProducerModelPredicate<T>,
	pagination?: PaginationInput
) => {
	await start();
	if (!isValidModelConstructor(modelConstructor)) {
		const msg = 'Constructor is not for a valid model';
		logger.error(msg, { modelConstructor });

		throw new Error(msg);
	}

	if (typeof idOrCriteria === 'string') {
		if (pagination !== undefined) {
			logger.warn('Pagination is ignored when querying by id');
		}

		const predicate = ModelPredicateCreator.createForId<T>(
			getModelDefinition(modelConstructor),
			idOrCriteria
		);
		const [result] = await storage.query(modelConstructor, predicate);

		if (result) {
			return result;
		}

		return undefined;
	}

	// Predicates.ALL means "all records", so no predicate (undefined)
	const predicate = !isPredicatesAll(idOrCriteria)
		? ModelPredicateCreator.createFromExisting(
				getModelDefinition(modelConstructor),
				idOrCriteria
		  )
		: undefined;

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

	return storage.query(modelConstructor, predicate, pagination);
};

let sync: SyncEngine;
let amplifyConfig: Record<string, any> = {};
let conflictHandler: ConflictHandler;
let errorHandler: (error: SyncError) => void;
let maxRecordsToSync: number;
let fullSyncInterval: number;

function configure(config: DataStoreConfig = {}) {
	const {
		DataStore: configDataStore,
		conflictHandler: configConflictHandler,
		errorHandler: configErrorHandler,
		maxRecordsToSync: configMaxRecordsToSync,
		fullSyncInterval: configFullSyncInterval,
		...configFromAmplify
	} = config;

	amplifyConfig = { ...configFromAmplify, ...amplifyConfig };

	conflictHandler =
		(configDataStore && configDataStore.conflictHandler) ||
		conflictHandler ||
		config.conflictHandler ||
		defaultConflictHandler;

	errorHandler =
		(configDataStore && configDataStore.errorHandler) ||
		errorHandler ||
		config.errorHandler ||
		defaultErrorHandler;

	maxRecordsToSync =
		(configDataStore && configDataStore.maxRecordsToSync) ||
		maxRecordsToSync ||
		config.maxRecordsToSync;

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

function defaultErrorHandler(error: SyncError) {
	logger.warn(error);
}

function getModelConstructorByModelName(
	namespaceName: NAMESPACES,
	modelName: string
) {
	switch (namespaceName) {
		case DATASTORE:
			return dataStoreClasses[modelName];
		case USER:
			return userClasses[modelName];
		case SYNC:
			return syncClasses[modelName];
		case STORAGE:
			return storageClasses[modelName];
		default:
			exhaustiveCheck(namespaceName);
			break;
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
			)
		);

		if (schemaVersionSetting !== undefined) {
			const storedValue = JSON.parse(schemaVersionSetting.value);

			if (storedValue !== version) {
				await s.clear(false);
			}
		}

		await s.save(
			modelInstanceCreator(Setting, {
				key: SETTING_SCHEMA_VERSION,
				value: JSON.stringify(version),
			})
		);
	});
}

let syncSubscription: ZenObservable.Subscription;

async function start(): Promise<void> {
	if (storage !== undefined) {
		return;
	}

	storage = new Storage(
		schema,
		namespaceResolver,
		getModelConstructorByModelName,
		modelInstanceCreator
	);

	await checkSchemaVersion(storage, schema.version);

	if (sync !== undefined) {
		return;
	}

	const { aws_appsync_graphqlEndpoint } = amplifyConfig;

	if (aws_appsync_graphqlEndpoint) {
		sync = new SyncEngine(
			schema,
			namespaceResolver,
			syncClasses,
			userClasses,
			storage,
			modelInstanceCreator,
			maxRecordsToSync,
			conflictHandler,
			errorHandler
		);

		const fullSyncIntervalInMilliseconds = fullSyncInterval * 1000 * 60; // fullSyncInterval from param is in minutes
		syncSubscription = sync
			.start({ fullSyncInterval: fullSyncIntervalInMilliseconds })
			.subscribe({
				error: err => {
					logger.warn('Sync error', err);
				},
			});
	}
}

async function clear() {
	if (storage === undefined) {
		return;
	}

	if (syncSubscription && !syncSubscription.closed) {
		syncSubscription.unsubscribe();
	}

	await storage.clear();

	storage = undefined;
	sync = undefined;
}

function getNamespace(): SchemaNamespace {
	const namespace: SchemaNamespace = {
		name: DATASTORE,
		relationships: {},
		enums: {},
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
	static getModuleName() {
		return 'DataStore';
	}
	static query = query;
	static save = save;
	static delete = remove;
	static observe = observe;
	static configure = configure;
	static clear = clear;
}

export { initSchema, DataStore };
