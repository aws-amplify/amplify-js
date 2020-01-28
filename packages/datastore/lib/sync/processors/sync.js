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
var api_1 = require('@aws-amplify/api');
var zen_observable_ts_1 = require('zen-observable-ts');
var utils_1 = require('../utils');
var core_1 = require('@aws-amplify/core');
var DEFAULT_PAGINATION_LIMIT = 100;
var DEFAULT_MAX_RECORDS_TO_SYNC = 10000;
var SyncProcessor = /** @class */ (function() {
	function SyncProcessor(schema, maxRecordsToSync) {
		if (maxRecordsToSync === void 0) {
			maxRecordsToSync = DEFAULT_MAX_RECORDS_TO_SYNC;
		}
		this.schema = schema;
		this.maxRecordsToSync = maxRecordsToSync;
		this.typeQuery = new WeakMap();
		this.generateQueries();
	}
	SyncProcessor.prototype.generateQueries = function() {
		var _this = this;
		Object.values(this.schema.namespaces).forEach(function(namespace) {
			Object.values(namespace.models)
				.filter(function(_a) {
					var syncable = _a.syncable;
					return syncable;
				})
				.forEach(function(model) {
					var _a = utils_1.buildGraphQLOperation(model, 'LIST')[0],
						_transformerMutationType = _a[0],
						opNameQuery = _a.slice(1);
					_this.typeQuery.set(model, opNameQuery);
				});
		});
	};
	SyncProcessor.prototype.retrievePage = function(
		modelDefinition,
		lastSync,
		nextToken,
		limit
	) {
		if (limit === void 0) {
			limit = null;
		}
		return __awaiter(this, void 0, void 0, function() {
			var _a,
				opName,
				query,
				variables,
				data,
				_b,
				opResult,
				items,
				newNextToken,
				startedAt;
			return __generator(this, function(_c) {
				switch (_c.label) {
					case 0:
						(_a = this.typeQuery.get(modelDefinition)),
							(opName = _a[0]),
							(query = _a[1]);
						variables = {
							limit: limit,
							nextToken: nextToken,
							lastSync: lastSync,
						};
						return [4 /*yield*/, this.jitteredRetry(query, variables)];
					case 1:
						data = _c.sent().data;
						(_b = opName), (opResult = data[_b]);
						(items = opResult.items),
							(newNextToken = opResult.nextToken),
							(startedAt = opResult.startedAt);
						return [
							2 /*return*/,
							{ nextToken: newNextToken, startedAt: startedAt, items: items },
						];
				}
			});
		});
	};
	SyncProcessor.prototype.jitteredRetry = function(query, variables) {
		return __awaiter(this, void 0, void 0, function() {
			var _this = this;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						return [
							4 /*yield*/,
							core_1.jitteredExponentialRetry(
								function(query, variables) {
									return __awaiter(_this, void 0, void 0, function() {
										return __generator(this, function(_a) {
											switch (_a.label) {
												case 0:
													return [
														4 /*yield*/,
														api_1.default.graphql({
															query: query,
															variables: variables,
														}),
													];
												case 1:
													return [2 /*return*/, _a.sent()];
											}
										});
									});
								},
								[query, variables]
							),
						];
					case 1:
						return [2 /*return*/, _a.sent()];
				}
			});
		});
	};
	SyncProcessor.prototype.start = function(typesLastSync) {
		var _this = this;
		var processing = true;
		var maxRecordsToSync =
			this.maxRecordsToSync !== undefined
				? this.maxRecordsToSync
				: DEFAULT_MAX_RECORDS_TO_SYNC;
		var parentPromises = new Map();
		var observable = new zen_observable_ts_1.default(function(observer) {
			var sortedTypesLastSyncs = Object.values(_this.schema.namespaces).reduce(
				function(map, namespace) {
					for (
						var _i = 0,
							_a = Array.from(namespace.modelTopologicalOrdering.keys());
						_i < _a.length;
						_i++
					) {
						var modelName = _a[_i];
						var typeLastSync = typesLastSync.get(namespace.models[modelName]);
						map.set(namespace.models[modelName], typeLastSync);
					}
					return map;
				},
				new Map()
			);
			var allModelsReady = Array.from(sortedTypesLastSyncs.entries())
				.filter(function(_a) {
					var syncable = _a[0].syncable;
					return syncable;
				})
				.map(function(_a) {
					var modelDefinition = _a[0],
						_b = _a[1],
						namespace = _b[0],
						lastSync = _b[1];
					return __awaiter(_this, void 0, void 0, function() {
						var done,
							nextToken,
							startedAt,
							items,
							recordsReceived,
							parents,
							promises,
							promise;
						var _this = this;
						return __generator(this, function(_c) {
							switch (_c.label) {
								case 0:
									done = false;
									nextToken = null;
									startedAt = null;
									items = null;
									recordsReceived = 0;
									parents = this.schema.namespaces[
										namespace
									].modelTopologicalOrdering.get(modelDefinition.name);
									promises = parents.map(function(parent) {
										return parentPromises.get(namespace + '_' + parent);
									});
									promise = new Promise(function(res) {
										return __awaiter(_this, void 0, void 0, function() {
											var limit;
											var _a;
											return __generator(this, function(_b) {
												switch (_b.label) {
													case 0:
														return [4 /*yield*/, Promise.all(promises)];
													case 1:
														_b.sent();
														_b.label = 2;
													case 2:
														if (!processing) {
															return [2 /*return*/];
														}
														limit = Math.min(
															maxRecordsToSync - recordsReceived,
															DEFAULT_PAGINATION_LIMIT
														);
														return [
															4 /*yield*/,
															this.retrievePage(
																modelDefinition,
																lastSync,
																nextToken,
																limit
															),
														];
													case 3:
														(_a = _b.sent()),
															(items = _a.items),
															(nextToken = _a.nextToken),
															(startedAt = _a.startedAt);
														recordsReceived += items.length;
														done =
															nextToken === null ||
															recordsReceived >= maxRecordsToSync;
														observer.next({
															namespace: namespace,
															modelDefinition: modelDefinition,
															items: items,
															done: done,
															startedAt: startedAt,
															isFullSync: !lastSync,
														});
														_b.label = 4;
													case 4:
														if (!done) return [3 /*break*/, 2];
														_b.label = 5;
													case 5:
														res();
														return [2 /*return*/];
												}
											});
										});
									});
									parentPromises.set(
										namespace + '_' + modelDefinition.name,
										promise
									);
									return [4 /*yield*/, promise];
								case 1:
									_c.sent();
									return [2 /*return*/];
							}
						});
					});
				});
			Promise.all(allModelsReady).then(function() {
				observer.complete();
			});
			return function() {
				processing = false;
			};
		});
		return observable;
	};
	return SyncProcessor;
})();
exports.SyncProcessor = SyncProcessor;
//# sourceMappingURL=sync.js.map
