'use strict';
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
Object.defineProperty(exports, '__esModule', { value: true });
var core_1 = require('@aws-amplify/core');
var zen_observable_ts_1 = require('zen-observable-ts');
var predicates_1 = require('../predicates');
var util_1 = require('../util');
var merger_1 = require('./merger');
var outbox_1 = require('./outbox');
var mutation_1 = require('./processors/mutation');
var subscription_1 = require('./processors/subscription');
var sync_1 = require('./processors/sync');
var utils_1 = require('./utils');
var logger = new core_1.ConsoleLogger('DataStore');
var ownSymbol = Symbol('sync');
var SyncEngine = /** @class */ (function() {
	function SyncEngine(
		schema,
		namespaceResolver,
		modelClasses,
		userModelClasses,
		storage,
		modelInstanceCreator,
		maxRecordsToSync,
		conflictHandler,
		errorHandler
	) {
		this.schema = schema;
		this.namespaceResolver = namespaceResolver;
		this.modelClasses = modelClasses;
		this.userModelClasses = userModelClasses;
		this.storage = storage;
		this.modelInstanceCreator = modelInstanceCreator;
		this.maxRecordsToSync = maxRecordsToSync;
		this.started = false;
		this.online = false;
		this.processingMutations = false;
		var MutationEvent = this.modelClasses['MutationEvent'];
		this.outbox = new outbox_1.MutationEventOutbox(
			this.schema,
			this.namespaceResolver,
			MutationEvent,
			ownSymbol
		);
		this.modelMerger = new merger_1.ModelMerger(this.outbox, ownSymbol);
		this.syncQueriesProcessor = new sync_1.SyncProcessor(
			this.schema,
			maxRecordsToSync
		);
		this.subscriptionsProcessor = new subscription_1.SubscriptionProcessor(
			this.schema
		);
		this.mutationsProcessor = new mutation_1.MutationProcessor(
			this.schema,
			this.storage,
			this.userModelClasses,
			this.outbox,
			this.modelInstanceCreator,
			MutationEvent,
			conflictHandler,
			errorHandler
		);
	}
	SyncEngine.prototype.start = function(params) {
		var _this = this;
		return new zen_observable_ts_1.default(function(observer) {
			logger.log('starting sync engine...');
			_this.started = true;
			var subscriptions = [];
			(function() {
				return __awaiter(_this, void 0, void 0, function() {
					var err_1;
					var _this = this;
					return __generator(this, function(_a) {
						switch (_a.label) {
							case 0:
								_a.trys.push([0, 2, , 3]);
								return [4 /*yield*/, this.setupModels(params)];
							case 1:
								_a.sent();
								return [3 /*break*/, 3];
							case 2:
								err_1 = _a.sent();
								logger.error(
									"Sync engine stopped. IndexedDB not supported in this browser's private mode"
								);
								return [2 /*return*/];
							case 3:
								new core_1.Reachability()
									.networkMonitor()
									.subscribe(function(_a) {
										var online = _a.online;
										return __awaiter(_this, void 0, void 0, function() {
											var _b,
												ctlSubsObservable,
												dataSubsObservable,
												_c,
												_d,
												err_2,
												currentTimeStamp,
												modelLastSync,
												paginatingModels,
												syncQueriesObservable,
												syncQuerySubscription,
												err_3;
											var _this = this;
											return __generator(this, function(_e) {
												switch (_e.label) {
													case 0:
														this.online = online;
														if (!online) return [3 /*break*/, 10];
														(_b = this.subscriptionsProcessor.start()),
															(ctlSubsObservable = _b[0]),
															(dataSubsObservable = _b[1]);
														_e.label = 1;
													case 1:
														_e.trys.push([1, 3, , 4]);
														_d = (_c = subscriptions).push;
														return [
															4 /*yield*/,
															this.waitForSubscriptionsReady(ctlSubsObservable),
														];
													case 2:
														_d.apply(_c, [_e.sent()]);
														return [3 /*break*/, 4];
													case 3:
														err_2 = _e.sent();
														observer.error(err_2);
														return [2 /*return*/];
													case 4:
														logger.log('Realtime ready');
														currentTimeStamp = new Date().getTime();
														return [
															4 /*yield*/,
															this.getModelsMetadataWithNextFullSync(
																currentTimeStamp
															),
														];
													case 5:
														modelLastSync = _e.sent();
														paginatingModels = new Set(modelLastSync.keys());
														syncQueriesObservable = this.syncQueriesProcessor.start(
															modelLastSync
														);
														if (this.isFullSync(modelLastSync)) {
															clearTimeout(this.fullSyncTimeoutId);
															this.fullSyncTimeoutId = undefined;
														}
														_e.label = 6;
													case 6:
														_e.trys.push([6, 8, , 9]);
														return [
															4 /*yield*/,
															this.waitForSyncQueries(
																syncQueriesObservable,
																paginatingModels
															),
														];
													case 7:
														syncQuerySubscription = _e.sent();
														if (syncQuerySubscription) {
															subscriptions.push(syncQuerySubscription);
														}
														return [3 /*break*/, 9];
													case 8:
														err_3 = _e.sent();
														observer.error(err_3);
														return [2 /*return*/];
													case 9:
														// process mutations
														subscriptions.push(
															this.mutationsProcessor
																.start()
																.subscribe(function(_a) {
																	var _transformerMutationType = _a[0],
																		modelDefinition = _a[1],
																		item = _a[2];
																	var modelConstructor =
																		_this.userModelClasses[
																			modelDefinition.name
																		];
																	var model = _this.modelInstanceCreator(
																		modelConstructor,
																		item
																	);
																	_this.modelMerger.merge(_this.storage, model);
																})
														);
														// TODO: extract to funciton
														subscriptions.push(
															dataSubsObservable.subscribe(function(_a) {
																var _transformerMutationType = _a[0],
																	modelDefinition = _a[1],
																	item = _a[2];
																var modelConstructor =
																	_this.userModelClasses[modelDefinition.name];
																var model = _this.modelInstanceCreator(
																	modelConstructor,
																	item
																);
																_this.modelMerger.merge(_this.storage, model);
															})
														);
														return [3 /*break*/, 11];
													case 10:
														subscriptions.forEach(function(sub) {
															return sub.unsubscribe();
														});
														subscriptions = [];
														_e.label = 11;
													case 11:
														return [2 /*return*/];
												}
											});
										});
									});
								this.storage
									.observe(null, null, ownSymbol)
									.filter(function(_a) {
										var model = _a.model;
										var modelDefinition = _this.getModelDefinition(model);
										return modelDefinition.syncable === true;
									})
									.subscribe({
										next: function(_a) {
											var opType = _a.opType,
												model = _a.model,
												element = _a.element,
												condition = _a.condition;
											return __awaiter(_this, void 0, void 0, function() {
												var namespace,
													MutationEventConstructor,
													graphQLCondition,
													mutationEvent;
												return __generator(this, function(_b) {
													switch (_b.label) {
														case 0:
															namespace = this.schema.namespaces[
																this.namespaceResolver(model)
															];
															MutationEventConstructor = this.modelClasses[
																'MutationEvent'
															];
															graphQLCondition = utils_1.predicateToGraphQLCondition(
																condition
															);
															mutationEvent = utils_1.createMutationInstanceFromModelOperation(
																namespace.relationships,
																this.getModelDefinition(model),
																opType,
																model,
																element,
																graphQLCondition,
																MutationEventConstructor,
																this.modelInstanceCreator
															);
															return [
																4 /*yield*/,
																this.outbox.enqueue(
																	this.storage,
																	mutationEvent
																),
															];
														case 1:
															_b.sent();
															if (this.online) {
																this.mutationsProcessor.resume();
															}
															return [2 /*return*/];
													}
												});
											});
										},
									});
								return [2 /*return*/];
						}
					});
				});
			})();
			return function() {
				subscriptions.forEach(function(sub) {
					return sub.unsubscribe();
				});
			};
		});
	};
	SyncEngine.prototype.getModelsMetadataWithNextFullSync = function(
		currentTimeStamp
	) {
		return __awaiter(this, void 0, void 0, function() {
			var modelLastSync, _a;
			var _this = this;
			return __generator(this, function(_b) {
				switch (_b.label) {
					case 0:
						_a = Map.bind;
						return [4 /*yield*/, this.getModelsMetadata()];
					case 1:
						modelLastSync = new (_a.apply(Map, [
							void 0,
							_b.sent().map(function(_a) {
								var namespace = _a.namespace,
									model = _a.model,
									lastSync = _a.lastSync,
									lastFullSync = _a.lastFullSync,
									fullSyncInterval = _a.fullSyncInterval;
								var nextFullSync = lastFullSync + fullSyncInterval;
								var syncFrom =
									!lastFullSync || nextFullSync < currentTimeStamp
										? 0 // perform full sync if expired
										: lastSync; // perform delta sync
								return [
									_this.schema.namespaces[namespace].models[model],
									[namespace, syncFrom],
								];
							}),
						]))();
						return [2 /*return*/, modelLastSync];
				}
			});
		});
	};
	SyncEngine.prototype.isFullSync = function(modelsMap) {
		for (
			var _i = 0, _a = Array.from(modelsMap.values());
			_i < _a.length;
			_i++
		) {
			var _b = _a[_i],
				syncFrom = _b[1];
			if (syncFrom === 0) {
				return true;
			}
		}
		return false;
	};
	SyncEngine.prototype.waitForSyncQueries = function(
		observable,
		paginatingModels
	) {
		return __awaiter(this, void 0, void 0, function() {
			var _this = this;
			return __generator(this, function(_a) {
				return [
					2 /*return*/,
					new Promise(function(resolve, reject) {
						if (!_this.online) {
							resolve();
						}
						var currentTimeStamp = new Date().getTime();
						var subscription = observable.subscribe({
							error: function(err) {
								reject(err);
							},
							next: function(_a) {
								var namespace = _a.namespace,
									modelDefinition = _a.modelDefinition,
									items = _a.items,
									done = _a.done,
									startedAt = _a.startedAt,
									isFullSync = _a.isFullSync;
								return __awaiter(_this, void 0, void 0, function() {
									var promises, modelMetadata_1, fullSyncInterval;
									var _this = this;
									return __generator(this, function(_b) {
										switch (_b.label) {
											case 0:
												promises = items.map(function(item) {
													return __awaiter(_this, void 0, void 0, function() {
														var modelConstructor, model;
														return __generator(this, function(_a) {
															modelConstructor = this.userModelClasses[
																modelDefinition.name
															];
															model = this.modelInstanceCreator(
																modelConstructor,
																item
															);
															return [
																2 /*return*/,
																this.modelMerger.merge(this.storage, model),
															];
														});
													});
												});
												return [4 /*yield*/, Promise.all(promises)];
											case 1:
												_b.sent();
												if (!done) return [3 /*break*/, 4];
												paginatingModels.delete(modelDefinition);
												return [
													4 /*yield*/,
													this.getModelMetadata(
														namespace,
														modelDefinition.name
													),
												];
											case 2:
												modelMetadata_1 = _b.sent();
												modelMetadata_1 = this.modelClasses.ModelMetadata.copyOf(
													modelMetadata_1,
													function(draft) {
														draft.lastSync = startedAt;
														draft.lastFullSync = isFullSync
															? currentTimeStamp
															: modelMetadata_1.lastFullSync;
													}
												);
												fullSyncInterval = modelMetadata_1.fullSyncInterval;
												return [
													4 /*yield*/,
													this.storage.save(
														modelMetadata_1,
														undefined,
														ownSymbol
													),
												];
											case 3:
												_b.sent();
												// resolve promise if all done
												if (paginatingModels.size === 0) {
													resolve(subscription);
												}
												if (isFullSync && !this.fullSyncTimeoutId) {
													// register next full sync when no full sync is already scheduled
													this.fullSyncTimeoutId = setTimeout(function() {
														return __awaiter(_this, void 0, void 0, function() {
															var currentTimeStamp,
																modelLastSync,
																paginatingModels,
																syncQueriesObservable;
															return __generator(this, function(_a) {
																switch (_a.label) {
																	case 0:
																		currentTimeStamp = new Date().getTime();
																		return [
																			4 /*yield*/,
																			this.getModelsMetadataWithNextFullSync(
																				currentTimeStamp
																			),
																		];
																	case 1:
																		modelLastSync = _a.sent();
																		paginatingModels = new Set(
																			modelLastSync.keys()
																		);
																		syncQueriesObservable = this.syncQueriesProcessor.start(
																			modelLastSync
																		);
																		this.fullSyncTimeoutId = undefined;
																		this.waitForSyncQueries(
																			syncQueriesObservable,
																			paginatingModels
																		);
																		return [2 /*return*/];
																}
															});
														});
													}, fullSyncInterval);
												}
												_b.label = 4;
											case 4:
												return [2 /*return*/];
										}
									});
								});
							},
						});
					}),
				];
			});
		});
	};
	SyncEngine.prototype.waitForSubscriptionsReady = function(ctlSubsObservable) {
		return __awaiter(this, void 0, void 0, function() {
			return __generator(this, function(_a) {
				return [
					2 /*return*/,
					new Promise(function(resolve, reject) {
						var subscription = ctlSubsObservable.subscribe({
							next: function(msg) {
								if (msg === subscription_1.CONTROL_MSG.CONNECTED) {
									resolve(subscription);
								}
							},
							error: function(err) {
								reject('subscription failed ' + err);
							},
						});
					}),
				];
			});
		});
	};
	SyncEngine.prototype.setupModels = function(params) {
		return __awaiter(this, void 0, void 0, function() {
			var fullSyncInterval, ModelMetadata, models, promises;
			var _this = this;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						fullSyncInterval = params.fullSyncInterval;
						ModelMetadata = this.modelClasses.ModelMetadata;
						models = [];
						Object.values(this.schema.namespaces).forEach(function(namespace) {
							Object.values(namespace.models)
								.filter(function(_a) {
									var syncable = _a.syncable;
									return syncable;
								})
								.forEach(function(model) {
									models.push([namespace.name, model.name]);
								});
						});
						promises = models.map(function(_a) {
							var namespace = _a[0],
								model = _a[1];
							return __awaiter(_this, void 0, void 0, function() {
								var modelMetadata;
								return __generator(this, function(_b) {
									switch (_b.label) {
										case 0:
											return [
												4 /*yield*/,
												this.getModelMetadata(namespace, model),
											];
										case 1:
											modelMetadata = _b.sent();
											if (!(modelMetadata === undefined))
												return [3 /*break*/, 3];
											return [
												4 /*yield*/,
												this.storage.save(
													this.modelInstanceCreator(ModelMetadata, {
														model: model,
														namespace: namespace,
														lastSync: null,
														fullSyncInterval: fullSyncInterval,
														lastFullSync: null,
													}),
													undefined,
													ownSymbol
												),
											];
										case 2:
											_b.sent();
											return [3 /*break*/, 5];
										case 3:
											return [
												4 /*yield*/,
												this.storage.save(
													this.modelClasses.ModelMetadata.copyOf(
														modelMetadata,
														function(draft) {
															draft.fullSyncInterval = fullSyncInterval;
														}
													)
												),
											];
										case 4:
											_b.sent();
											_b.label = 5;
										case 5:
											return [2 /*return*/];
									}
								});
							});
						});
						return [4 /*yield*/, Promise.all(promises)];
					case 1:
						_a.sent();
						return [2 /*return*/];
				}
			});
		});
	};
	SyncEngine.prototype.getModelsMetadata = function() {
		return __awaiter(this, void 0, void 0, function() {
			var ModelMetadata, modelsMetadata;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						ModelMetadata = this.modelClasses.ModelMetadata;
						return [4 /*yield*/, this.storage.query(ModelMetadata)];
					case 1:
						modelsMetadata = _a.sent();
						return [2 /*return*/, modelsMetadata];
				}
			});
		});
	};
	SyncEngine.prototype.getModelMetadata = function(namespace, model) {
		return __awaiter(this, void 0, void 0, function() {
			var ModelMetadata, predicate, modelMetadata;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						ModelMetadata = this.modelClasses.ModelMetadata;
						predicate = predicates_1.ModelPredicateCreator.createFromExisting(
							this.schema.namespaces[util_1.SYNC].models[ModelMetadata.name],
							function(c) {
								return c.namespace('eq', namespace).model('eq', model);
							}
						);
						return [4 /*yield*/, this.storage.query(ModelMetadata, predicate)];
					case 1:
						modelMetadata = _a.sent()[0];
						return [2 /*return*/, modelMetadata];
				}
			});
		});
	};
	SyncEngine.prototype.getModelDefinition = function(modelConstructor) {
		var namespaceName = this.namespaceResolver(modelConstructor);
		var modelDefinition = this.schema.namespaces[namespaceName].models[
			modelConstructor.name
		];
		return modelDefinition;
	};
	SyncEngine.getNamespace = function() {
		var namespace = {
			name: util_1.SYNC,
			relationships: {},
			enums: {
				OperationType: {
					name: 'OperationType',
					values: ['CREATE', 'UPDATE', 'DELETE'],
				},
			},
			models: {
				MutationEvent: {
					name: 'MutationEvent',
					pluralName: 'MutationEvents',
					syncable: false,
					fields: {
						id: {
							name: 'id',
							type: 'ID',
							isRequired: true,
							isArray: false,
						},
						model: {
							name: 'model',
							type: 'String',
							isRequired: true,
							isArray: false,
						},
						data: {
							name: 'data',
							type: 'String',
							isRequired: true,
							isArray: false,
						},
						modelId: {
							name: 'modelId',
							type: 'String',
							isRequired: true,
							isArray: false,
						},
						operation: {
							name: 'operation',
							type: {
								enum: 'Operationtype',
							},
							isArray: false,
							isRequired: true,
						},
						condition: {
							name: 'condition',
							type: 'String',
							isArray: false,
							isRequired: true,
						},
					},
				},
				ModelMetadata: {
					name: 'ModelMetadata',
					pluralName: 'ModelsMetadata',
					syncable: false,
					fields: {
						id: {
							name: 'id',
							type: 'ID',
							isRequired: true,
							isArray: false,
						},
						namespace: {
							name: 'namespace',
							type: 'String',
							isRequired: true,
							isArray: false,
						},
						model: {
							name: 'model',
							type: 'String',
							isRequired: true,
							isArray: false,
						},
						lastSync: {
							name: 'lastSync',
							type: 'Int',
							isRequired: false,
							isArray: false,
						},
						lastFullSync: {
							name: 'lastFullSync',
							type: 'Int',
							isRequired: false,
							isArray: false,
						},
						fullSyncInterval: {
							name: 'fullSyncInterval',
							type: 'Int',
							isRequired: true,
							isArray: false,
						},
					},
				},
			},
		};
		return namespace;
	};
	return SyncEngine;
})();
exports.SyncEngine = SyncEngine;
//# sourceMappingURL=index.js.map
