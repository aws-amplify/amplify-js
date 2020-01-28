'use strict';
var __assign =
	(this && this.__assign) ||
	function() {
		__assign =
			Object.assign ||
			function(t) {
				for (var s, i = 1, n = arguments.length; i < n; i++) {
					s = arguments[i];
					for (var p in s)
						if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
				}
				return t;
			};
		return __assign.apply(this, arguments);
	};
var __awaiter =
	(this && this.__awaiter) ||
	function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function(resolve) {
						resolve(value);
				  });
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator['throw'](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
var __generator =
	(this && this.__generator) ||
	function(thisArg, body) {
		var _ = {
				label: 0,
				sent: function() {
					if (t[0] & 1) throw t[1];
					return t[1];
				},
				trys: [],
				ops: [],
			},
			f,
			y,
			t,
			g;
		return (
			(g = { next: verb(0), throw: verb(1), return: verb(2) }),
			typeof Symbol === 'function' &&
				(g[Symbol.iterator] = function() {
					return this;
				}),
			g
		);
		function verb(n) {
			return function(v) {
				return step([n, v]);
			};
		}
		function step(op) {
			if (f) throw new TypeError('Generator is already executing.');
			while (_)
				try {
					if (
						((f = 1),
						y &&
							(t =
								op[0] & 2
									? y['return']
									: op[0]
									? y['throw'] || ((t = y['return']) && t.call(y), 0)
									: y.next) &&
							!(t = t.call(y, op[1])).done)
					)
						return t;
					if (((y = 0), t)) op = [op[0] & 2, t.value];
					switch (op[0]) {
						case 0:
						case 1:
							t = op;
							break;
						case 4:
							_.label++;
							return { value: op[1], done: false };
						case 5:
							_.label++;
							y = op[1];
							op = [0];
							continue;
						case 7:
							op = _.ops.pop();
							_.trys.pop();
							continue;
						default:
							if (
								!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
								(op[0] === 6 || op[0] === 2)
							) {
								_ = 0;
								continue;
							}
							if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
								_.label = op[1];
								break;
							}
							if (op[0] === 6 && _.label < t[1]) {
								_.label = t[1];
								t = op;
								break;
							}
							if (t && _.label < t[2]) {
								_.label = t[2];
								_.ops.push(op);
								break;
							}
							if (t[2]) _.ops.pop();
							_.trys.pop();
							continue;
					}
					op = body.call(thisArg, _);
				} catch (e) {
					op = [6, e];
					y = 0;
				} finally {
					f = t = 0;
				}
			if (op[0] & 5) throw op[1];
			return { value: op[0] ? op[1] : void 0, done: true };
		}
	};
var __rest =
	(this && this.__rest) ||
	function(s, e) {
		var t = {};
		for (var p in s)
			if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
				t[p] = s[p];
		if (s != null && typeof Object.getOwnPropertySymbols === 'function')
			for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
				if (
					e.indexOf(p[i]) < 0 &&
					Object.prototype.propertyIsEnumerable.call(s, p[i])
				)
					t[p[i]] = s[p[i]];
			}
		return t;
	};
Object.defineProperty(exports, '__esModule', { value: true });
var core_1 = require('@aws-amplify/core');
var immer_1 = require('immer');
var uuid_1 = require('uuid');
var predicates_1 = require('../predicates');
var storage_1 = require('../storage/storage');
var sync_1 = require('../sync');
var types_1 = require('../types');
var util_1 = require('../util');
immer_1.setAutoFreeze(true);
var logger = new core_1.ConsoleLogger('DataStore');
var SETTING_SCHEMA_VERSION = 'schemaVersion';
var storage;
var schema;
var classNamespaceMap = new WeakMap();
var getModelDefinition = function(modelConstructor) {
	var namespace = classNamespaceMap.get(modelConstructor);
	return schema.namespaces[namespace].models[modelConstructor.name];
};
var isValidModelConstructor = function(obj) {
	return util_1.isModelConstructor(obj) && classNamespaceMap.has(obj);
};
var namespaceResolver = function(modelConstructor) {
	return classNamespaceMap.get(modelConstructor);
};
var dataStoreClasses;
var userClasses;
var syncClasses;
var storageClasses;
var initSchema = function(userSchema) {
	var _a;
	if (schema !== undefined) {
		throw new Error('The schema has already been initialized');
	}
	logger.log('validating schema', { schema: userSchema });
	var internalUserNamespace = __assign({ name: util_1.USER }, userSchema);
	logger.log('DataStore', 'Init models');
	userClasses = createModelClassses(internalUserNamespace);
	logger.log('DataStore', 'Models initialized');
	var dataStoreNamespace = getNamespace();
	var storageNamespace = storage_1.default.getNamespace();
	var syncNamespace = sync_1.SyncEngine.getNamespace();
	dataStoreClasses = createModelClassses(dataStoreNamespace);
	storageClasses = createModelClassses(storageNamespace);
	syncClasses = createModelClassses(syncNamespace);
	schema = {
		namespaces:
			((_a = {}),
			(_a[dataStoreNamespace.name] = dataStoreNamespace),
			(_a[internalUserNamespace.name] = internalUserNamespace),
			(_a[storageNamespace.name] = storageNamespace),
			(_a[syncNamespace.name] = syncNamespace),
			_a),
		version: userSchema.version,
	};
	Object.keys(schema.namespaces).forEach(function(namespace) {
		schema.namespaces[namespace].relationships = util_1.establishRelation(
			schema.namespaces[namespace]
		);
		var modelAssociations = new Map();
		Object.values(schema.namespaces[namespace].models).forEach(function(model) {
			var wea = [];
			Object.values(model.fields)
				.filter(function(field) {
					return (
						field.association &&
						field.association.connectionType === 'BELONGS_TO' &&
						field.type.model !== model.name
					);
				})
				.forEach(function(field) {
					return wea.push(field.type.model);
				});
			modelAssociations.set(model.name, wea);
		});
		var result = new Map();
		var count = 1000;
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
			for (
				var _i = 0, _a = Array.from(modelAssociations.keys());
				_i < _a.length;
				_i++
			) {
				var modelName = _a[_i];
				var parents = modelAssociations.get(modelName);
				if (
					parents.every(function(x) {
						return result.has(x);
					})
				) {
					result.set(modelName, parents);
				}
			}
			Array.from(result.keys()).forEach(function(x) {
				return modelAssociations.delete(x);
			});
		}
		schema.namespaces[namespace].modelTopologicalOrdering = result;
	});
	return userClasses;
};
exports.initSchema = initSchema;
var createModelClassses = function(namespace) {
	var classes = {};
	Object.entries(namespace.models).forEach(function(_a) {
		var modelName = _a[0],
			modelDefinition = _a[1];
		var clazz = createModelClass(modelDefinition);
		classes[modelName] = clazz;
		classNamespaceMap.set(clazz, namespace.name);
	});
	return classes;
};
var instancesMetadata = new WeakSet();
function modelInstanceCreator(modelConstructor, init) {
	instancesMetadata.add(init);
	return new modelConstructor(init);
}
var createModelClass = function(modelDefinition) {
	var clazz = /** @class */ (function() {
		function Model(init) {
			var modelInstanceMetadata = instancesMetadata.has(init) ? init : {};
			var _id = modelInstanceMetadata.id,
				_version = modelInstanceMetadata._version,
				_lastChangedAt = modelInstanceMetadata._lastChangedAt,
				_deleted = modelInstanceMetadata._deleted;
			var id =
				// instancesIds is set by modelInstanceCreator, it is accessible only internally
				_id !== null && _id !== undefined
					? _id
					: modelDefinition.syncable
					? uuid_1.v4()
					: // Transform UUID v1 into a lexicographically sortable string
					  uuid_1.v1().replace(/^(.{8})-(.{4})-(.{4})/, '$3-$2-$1');
			var instance = immer_1.produce(this, function(draft) {
				Object.entries(init).forEach(function(_a) {
					var k = _a[0],
						v = _a[1];
					var fieldDefinition = modelDefinition.fields[k];
					if (fieldDefinition !== undefined) {
						var type = fieldDefinition.type,
							isRequired = fieldDefinition.isRequired,
							name_1 = fieldDefinition.name,
							isArray = fieldDefinition.isArray;
						if (isRequired && (v === null || v === undefined)) {
							throw new Error('Field ' + name_1 + ' is required');
						}
						if (types_1.isGraphQLScalarType(type)) {
							var jsType_1 = types_1.GraphQLScalarType.getJSType(type);
							if (isArray) {
								if (!Array.isArray(v)) {
									throw new Error(
										'Field ' +
											name_1 +
											' should be of type ' +
											jsType_1 +
											'[], ' +
											typeof v +
											' received. ' +
											v
									);
								}
								if (
									v.some(function(e) {
										return typeof e !== jsType_1;
									})
								) {
									var elemTypes = v
										.map(function(e) {
											return typeof e;
										})
										.join(',');
									throw new Error(
										'All elements in the ' +
											name_1 +
											' array should be of type ' +
											jsType_1 +
											', [' +
											elemTypes +
											'] received. ' +
											v
									);
								}
							} else if (typeof v !== jsType_1 && v !== null) {
								throw new Error(
									'Field ' +
										name_1 +
										' should be of type ' +
										jsType_1 +
										', ' +
										typeof v +
										' received. ' +
										v
								);
							}
						}
					}
					draft[k] = v;
				});
				draft.id = id;
				if (modelDefinition.syncable) {
					draft._version = _version;
					draft._lastChangedAt = _lastChangedAt;
					draft._deleted = _deleted;
				}
			});
			return instance;
		}
		Model.copyOf = function(source, fn) {
			if (
				!isValidModelConstructor(
					Object.getPrototypeOf(source || {}).constructor
				)
			) {
				var msg = 'The source object is not a valid model';
				logger.error(msg, { source: source });
				throw new Error(msg);
			}
			return immer_1.produce(source, function(draft) {
				fn(draft);
				draft.id = source.id;
			});
		};
		return Model;
	})();
	clazz[immer_1.immerable] = true;
	Object.defineProperty(clazz, 'name', { value: modelDefinition.name });
	return clazz;
};
var save = function(model, condition) {
	return __awaiter(void 0, void 0, void 0, function() {
		var modelConstructor, msg, modelDefinition, producedCondition, savedModel;
		return __generator(this, function(_a) {
			switch (_a.label) {
				case 0:
					return [4 /*yield*/, start()];
				case 1:
					_a.sent();
					modelConstructor = model ? model.constructor : undefined;
					if (!isValidModelConstructor(modelConstructor)) {
						msg = 'Object is not an instance of a valid model';
						logger.error(msg, { model: model });
						throw new Error(msg);
					}
					modelDefinition = getModelDefinition(modelConstructor);
					producedCondition = predicates_1.ModelPredicateCreator.createFromExisting(
						modelDefinition,
						condition
					);
					return [
						4 /*yield*/,
						storage.runExclusive(function(s) {
							return __awaiter(void 0, void 0, void 0, function() {
								return __generator(this, function(_a) {
									switch (_a.label) {
										case 0:
											return [4 /*yield*/, s.save(model, producedCondition)];
										case 1:
											_a.sent();
											return [
												2 /*return*/,
												s.query(
													modelConstructor,
													predicates_1.ModelPredicateCreator.createForId(
														modelDefinition,
														model.id
													)
												),
											];
									}
								});
							});
						}),
					];
				case 2:
					savedModel = _a.sent();
					return [2 /*return*/, savedModel];
			}
		});
	});
};
var remove = function(modelOrConstructor, idOrCriteria) {
	return __awaiter(void 0, void 0, void 0, function() {
		var condition,
			msg,
			modelConstructor,
			msg,
			msg,
			deleted,
			model,
			modelConstructor,
			msg,
			modelDefinition,
			idPredicate,
			msg,
			deleted;
		return __generator(this, function(_a) {
			switch (_a.label) {
				case 0:
					return [4 /*yield*/, start()];
				case 1:
					_a.sent();
					if (!modelOrConstructor) {
						msg = 'Model or Model Constructor required';
						logger.error(msg, { modelOrConstructor: modelOrConstructor });
						throw new Error(msg);
					}
					if (!isValidModelConstructor(modelOrConstructor))
						return [3 /*break*/, 3];
					modelConstructor = modelOrConstructor;
					if (!idOrCriteria) {
						msg =
							'Id to delete or criteria required. Do you want to delete all? Pass Predicates.ALL';
						logger.error(msg, { idOrCriteria: idOrCriteria });
						throw new Error(msg);
					}
					if (typeof idOrCriteria === 'string') {
						condition = predicates_1.ModelPredicateCreator.createForId(
							getModelDefinition(modelConstructor),
							idOrCriteria
						);
					} else {
						condition = predicates_1.ModelPredicateCreator.createFromExisting(
							getModelDefinition(modelConstructor),
							idOrCriteria
						);
						if (
							!condition ||
							!predicates_1.ModelPredicateCreator.isValidPredicate(condition)
						) {
							msg =
								'Criteria required. Do you want to delete all? Pass Predicates.ALL';
							logger.error(msg, { condition: condition });
							throw new Error(msg);
						}
					}
					return [4 /*yield*/, storage.delete(modelConstructor, condition)];
				case 2:
					deleted = _a.sent()[0];
					return [2 /*return*/, deleted];
				case 3:
					model = modelOrConstructor;
					modelConstructor = Object.getPrototypeOf(model || {}).constructor;
					if (!isValidModelConstructor(modelConstructor)) {
						msg = 'Object is not an instance of a valid model';
						logger.error(msg, { model: model });
						throw new Error(msg);
					}
					modelDefinition = getModelDefinition(modelConstructor);
					idPredicate = predicates_1.ModelPredicateCreator.createForId(
						modelDefinition,
						model.id
					);
					if (idOrCriteria) {
						if (typeof idOrCriteria !== 'function') {
							msg = 'Invalid criteria';
							logger.error(msg, { idOrCriteria: idOrCriteria });
							throw new Error(msg);
						}
						condition = idOrCriteria(idPredicate);
					} else {
						condition = idPredicate;
					}
					return [4 /*yield*/, storage.delete(model, condition)];
				case 4:
					deleted = _a.sent()[0][0];
					return [2 /*return*/, deleted];
			}
		});
	});
};
var observe = function(modelConstructor, idOrCriteria) {
	start();
	var predicate;
	if (idOrCriteria !== undefined && modelConstructor === undefined) {
		var msg = 'Cannot provide criteria without a modelConstructor';
		logger.error(msg, idOrCriteria);
		throw new Error(msg);
	}
	if (modelConstructor && !isValidModelConstructor(modelConstructor)) {
		var msg = 'Constructor is not for a valid model';
		logger.error(msg, { modelConstructor: modelConstructor });
		throw new Error(msg);
	}
	if (typeof idOrCriteria === 'string') {
		predicate = predicates_1.ModelPredicateCreator.createForId(
			getModelDefinition(modelConstructor),
			idOrCriteria
		);
	} else {
		predicate =
			modelConstructor &&
			predicates_1.ModelPredicateCreator.createFromExisting(
				getModelDefinition(modelConstructor),
				idOrCriteria
			);
	}
	return storage.observe(modelConstructor, predicate).filter(function(_a) {
		var model = _a.model;
		return namespaceResolver(model) === util_1.USER;
	});
};
var query = function(modelConstructor, idOrCriteria, pagination) {
	return __awaiter(void 0, void 0, void 0, function() {
		var msg, predicate_1, result, predicate, _a, limit, page;
		return __generator(this, function(_b) {
			switch (_b.label) {
				case 0:
					return [4 /*yield*/, start()];
				case 1:
					_b.sent();
					if (!isValidModelConstructor(modelConstructor)) {
						msg = 'Constructor is not for a valid model';
						logger.error(msg, { modelConstructor: modelConstructor });
						throw new Error(msg);
					}
					if (!(typeof idOrCriteria === 'string')) return [3 /*break*/, 3];
					if (pagination !== undefined) {
						logger.warn('Pagination is ignored when querying by id');
					}
					predicate_1 = predicates_1.ModelPredicateCreator.createForId(
						getModelDefinition(modelConstructor),
						idOrCriteria
					);
					return [4 /*yield*/, storage.query(modelConstructor, predicate_1)];
				case 2:
					result = _b.sent()[0];
					if (result) {
						return [2 /*return*/, result];
					}
					return [2 /*return*/, undefined];
				case 3:
					predicate = !predicates_1.isPredicatesAll(idOrCriteria)
						? predicates_1.ModelPredicateCreator.createFromExisting(
								getModelDefinition(modelConstructor),
								idOrCriteria
						  )
						: undefined;
					(_a = pagination || {}), (limit = _a.limit), (page = _a.page);
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
					return [
						2 /*return*/,
						storage.query(modelConstructor, predicate, pagination),
					];
			}
		});
	});
};
var sync;
var amplifyConfig = {};
var conflictHandler;
var errorHandler;
var maxRecordsToSync;
var fullSyncInterval;
function configure(config) {
	if (config === void 0) {
		config = {};
	}
	var configDataStore = config.DataStore,
		configConflictHandler = config.conflictHandler,
		configErrorHandler = config.errorHandler,
		configMaxRecordsToSync = config.maxRecordsToSync,
		configFullSyncInterval = config.fullSyncInterval,
		configFromAmplify = __rest(config, [
			'DataStore',
			'conflictHandler',
			'errorHandler',
			'maxRecordsToSync',
			'fullSyncInterval',
		]);
	amplifyConfig = __assign(__assign({}, configFromAmplify), amplifyConfig);
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
function defaultConflictHandler(conflictData) {
	var localModel = conflictData.localModel,
		modelConstructor = conflictData.modelConstructor,
		remoteModel = conflictData.remoteModel;
	var _version = remoteModel._version;
	return modelInstanceCreator(
		modelConstructor,
		__assign(__assign({}, localModel), { _version: _version })
	);
}
function defaultErrorHandler(error) {
	logger.warn(error);
}
function getModelConstructorByModelName(namespaceName, modelName) {
	switch (namespaceName) {
		case util_1.DATASTORE:
			return dataStoreClasses[modelName];
		case util_1.USER:
			return userClasses[modelName];
		case util_1.SYNC:
			return syncClasses[modelName];
		case util_1.STORAGE:
			return storageClasses[modelName];
		default:
			util_1.exhaustiveCheck(namespaceName);
			break;
	}
}
function checkSchemaVersion(storage, version) {
	return __awaiter(this, void 0, void 0, function() {
		var Setting, modelDefinition;
		var _this = this;
		return __generator(this, function(_a) {
			switch (_a.label) {
				case 0:
					Setting = dataStoreClasses.Setting;
					modelDefinition = schema.namespaces[util_1.DATASTORE].models.Setting;
					return [
						4 /*yield*/,
						storage.runExclusive(function(s) {
							return __awaiter(_this, void 0, void 0, function() {
								var schemaVersionSetting, storedValue;
								return __generator(this, function(_a) {
									switch (_a.label) {
										case 0:
											return [
												4 /*yield*/,
												s.query(
													Setting,
													predicates_1.ModelPredicateCreator.createFromExisting(
														modelDefinition,
														function(c) {
															return c.key('eq', SETTING_SCHEMA_VERSION);
														}
													)
												),
											];
										case 1:
											schemaVersionSetting = _a.sent()[0];
											if (!(schemaVersionSetting !== undefined))
												return [3 /*break*/, 3];
											storedValue = JSON.parse(schemaVersionSetting.value);
											if (!(storedValue !== version)) return [3 /*break*/, 3];
											return [4 /*yield*/, s.clear(false)];
										case 2:
											_a.sent();
											_a.label = 3;
										case 3:
											return [
												4 /*yield*/,
												s.save(
													modelInstanceCreator(Setting, {
														key: SETTING_SCHEMA_VERSION,
														value: JSON.stringify(version),
													})
												),
											];
										case 4:
											_a.sent();
											return [2 /*return*/];
									}
								});
							});
						}),
					];
				case 1:
					_a.sent();
					return [2 /*return*/];
			}
		});
	});
}
var syncSubscription;
function start() {
	return __awaiter(this, void 0, void 0, function() {
		var aws_appsync_graphqlEndpoint, fullSyncIntervalInMilliseconds;
		return __generator(this, function(_a) {
			switch (_a.label) {
				case 0:
					if (storage !== undefined) {
						return [2 /*return*/];
					}
					storage = new storage_1.default(
						schema,
						namespaceResolver,
						getModelConstructorByModelName,
						modelInstanceCreator
					);
					return [4 /*yield*/, checkSchemaVersion(storage, schema.version)];
				case 1:
					_a.sent();
					if (sync !== undefined) {
						return [2 /*return*/];
					}
					aws_appsync_graphqlEndpoint =
						amplifyConfig.aws_appsync_graphqlEndpoint;
					if (aws_appsync_graphqlEndpoint) {
						sync = new sync_1.SyncEngine(
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
						fullSyncIntervalInMilliseconds = fullSyncInterval * 1000 * 60;
						syncSubscription = sync
							.start({ fullSyncInterval: fullSyncIntervalInMilliseconds })
							.subscribe({
								error: function(err) {
									logger.warn('Sync error', err);
								},
							});
					}
					return [2 /*return*/];
			}
		});
	});
}
function clear() {
	return __awaiter(this, void 0, void 0, function() {
		return __generator(this, function(_a) {
			switch (_a.label) {
				case 0:
					if (storage === undefined) {
						return [2 /*return*/];
					}
					if (syncSubscription && !syncSubscription.closed) {
						syncSubscription.unsubscribe();
					}
					return [4 /*yield*/, storage.clear()];
				case 1:
					_a.sent();
					storage = undefined;
					sync = undefined;
					return [2 /*return*/];
			}
		});
	});
}
function getNamespace() {
	var namespace = {
		name: util_1.DATASTORE,
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
var dataStore = {
	query: query,
	save: save,
	delete: remove,
	observe: observe,
	configure: configure,
	clear: clear,
};
exports.dataStore = dataStore;
//# sourceMappingURL=datastore.js.map
