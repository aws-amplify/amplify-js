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
var __asyncValues =
	(this && this.__asyncValues) ||
	function(o) {
		if (!Symbol.asyncIterator)
			throw new TypeError('Symbol.asyncIterator is not defined.');
		var m = o[Symbol.asyncIterator],
			i;
		return m
			? m.call(o)
			: ((o =
					typeof __values === 'function' ? __values(o) : o[Symbol.iterator]()),
			  (i = {}),
			  verb('next'),
			  verb('throw'),
			  verb('return'),
			  (i[Symbol.asyncIterator] = function() {
					return this;
			  }),
			  i);
		function verb(n) {
			i[n] =
				o[n] &&
				function(v) {
					return new Promise(function(resolve, reject) {
						(v = o[n](v)), settle(resolve, reject, v.done, v.value);
					});
				};
		}
		function settle(resolve, reject, d, v) {
			Promise.resolve(v).then(function(v) {
				resolve({ value: v, done: d });
			}, reject);
		}
	};
var __spreadArrays =
	(this && this.__spreadArrays) ||
	function() {
		for (var s = 0, i = 0, il = arguments.length; i < il; i++)
			s += arguments[i].length;
		for (var r = Array(s), k = 0, i = 0; i < il; i++)
			for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
				r[k] = a[j];
		return r;
	};
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import * as idb from 'idb';
import { ModelPredicateCreator } from '../../predicates';
import { isPredicateObj, OpType, QueryOne } from '../../types';
import {
	exhaustiveCheck,
	getIndex,
	isModelConstructor,
	traverseModel,
	validatePredicate,
	isPrivateMode,
} from '../../util';
var logger = new Logger('DataStore');
var DB_NAME = 'amplify-datastore';
var IndexedDBAdapter = /** @class */ (function() {
	function IndexedDBAdapter() {}
	IndexedDBAdapter.prototype.checkPrivate = function() {
		return __awaiter(this, void 0, void 0, function() {
			var isPrivate;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						return [
							4 /*yield*/,
							isPrivateMode().then(function(isPrivate) {
								return isPrivate;
							}),
						];
					case 1:
						isPrivate = _a.sent();
						if (isPrivate) {
							logger.error(
								"IndexedDB not supported in this browser's private mode"
							);
							return [
								2 /*return*/,
								Promise.reject(
									"IndexedDB not supported in this browser's private mode"
								),
							];
						} else {
							return [2 /*return*/, Promise.resolve()];
						}
						return [2 /*return*/];
				}
			});
		});
	};
	IndexedDBAdapter.prototype.getStorenameForModel = function(modelConstructor) {
		var namespace = this.namespaceResolver(modelConstructor);
		var modelName = modelConstructor.name;
		return this.getStorename(namespace, modelName);
	};
	IndexedDBAdapter.prototype.getStorename = function(namespace, modelName) {
		var storeName = namespace + '_' + modelName;
		return storeName;
	};
	IndexedDBAdapter.prototype.setUp = function(
		theSchema,
		namespaceResolver,
		modelInstanceCreator,
		getModelConstructorByModelName
	) {
		return __awaiter(this, void 0, void 0, function() {
			var _a, error_1;
			var _this = this;
			return __generator(this, function(_b) {
				switch (_b.label) {
					case 0:
						return [4 /*yield*/, this.checkPrivate()];
					case 1:
						_b.sent();
						if (!!this.initPromise) return [3 /*break*/, 2];
						this.initPromise = new Promise(function(res, rej) {
							_this.resolve = res;
							_this.reject = rej;
						});
						return [3 /*break*/, 4];
					case 2:
						return [4 /*yield*/, this.initPromise];
					case 3:
						_b.sent();
						_b.label = 4;
					case 4:
						this.schema = theSchema;
						this.namespaceResolver = namespaceResolver;
						this.modelInstanceCreator = modelInstanceCreator;
						this.getModelConstructorByModelName = getModelConstructorByModelName;
						_b.label = 5;
					case 5:
						_b.trys.push([5, 8, , 9]);
						if (!!this.db) return [3 /*break*/, 7];
						_a = this;
						return [
							4 /*yield*/,
							idb.openDB(DB_NAME, 1, {
								upgrade: function(db, _oldVersion, _newVersion, _txn) {
									var keyPath = 'id';
									Object.keys(theSchema.namespaces).forEach(function(
										namespaceName
									) {
										var namespace = theSchema.namespaces[namespaceName];
										Object.keys(namespace.models).forEach(function(modelName) {
											var indexes =
												_this.schema.namespaces[namespaceName].relationships[
													modelName
												].indexes;
											var storeName = _this.getStorename(
												namespaceName,
												modelName
											);
											var store = db.createObjectStore(storeName, {
												keyPath: keyPath,
											});
											indexes.forEach(function(index) {
												return store.createIndex(index, index);
											});
										});
									});
								},
							}),
						];
					case 6:
						_a.db = _b.sent();
						this.resolve();
						_b.label = 7;
					case 7:
						return [3 /*break*/, 9];
					case 8:
						error_1 = _b.sent();
						this.reject(error_1);
						return [3 /*break*/, 9];
					case 9:
						return [2 /*return*/];
				}
			});
		});
	};
	IndexedDBAdapter.prototype.save = function(model, condition) {
		var e_1, _a;
		return __awaiter(this, void 0, void 0, function() {
			var modelConstructor,
				storeName,
				connectedModels,
				namespaceName,
				set,
				connectionStoreNames,
				tx,
				store,
				fromDB,
				predicates,
				predicateObjs,
				type,
				isValid,
				msg,
				result,
				connectionStoreNames_1,
				connectionStoreNames_1_1,
				resItem,
				storeName_1,
				item,
				instance,
				store_1,
				id,
				opType,
				e_1_1;
			var _this = this;
			return __generator(this, function(_b) {
				switch (_b.label) {
					case 0:
						return [4 /*yield*/, this.checkPrivate()];
					case 1:
						_b.sent();
						modelConstructor = Object.getPrototypeOf(model).constructor;
						storeName = this.getStorenameForModel(modelConstructor);
						connectedModels = traverseModel(
							modelConstructor.name,
							model,
							this.schema.namespaces[this.namespaceResolver(modelConstructor)],
							this.modelInstanceCreator,
							this.getModelConstructorByModelName
						);
						namespaceName = this.namespaceResolver(modelConstructor);
						set = new Set();
						connectionStoreNames = Object.values(connectedModels).map(function(
							_a
						) {
							var modelName = _a.modelName,
								item = _a.item,
								instance = _a.instance;
							var storeName = _this.getStorename(namespaceName, modelName);
							set.add(storeName);
							return { storeName: storeName, item: item, instance: instance };
						});
						tx = this.db.transaction(
							__spreadArrays([storeName], Array.from(set.values())),
							'readwrite'
						);
						store = tx.objectStore(storeName);
						return [4 /*yield*/, store.get(model.id)];
					case 2:
						fromDB = _b.sent();
						if (condition) {
							predicates = ModelPredicateCreator.getPredicates(condition);
							(predicateObjs = predicates.predicates), (type = predicates.type);
							isValid = validatePredicate(fromDB, type, predicateObjs);
							if (!isValid) {
								msg = 'Conditional update failed';
								logger.error(msg, { model: fromDB, condition: predicateObjs });
								throw new Error(msg);
							}
						}
						result = [];
						_b.label = 3;
					case 3:
						_b.trys.push([3, 12, 13, 18]);
						connectionStoreNames_1 = __asyncValues(connectionStoreNames);
						_b.label = 4;
					case 4:
						return [4 /*yield*/, connectionStoreNames_1.next()];
					case 5:
						if (
							!((connectionStoreNames_1_1 = _b.sent()),
							!connectionStoreNames_1_1.done)
						)
							return [3 /*break*/, 11];
						resItem = connectionStoreNames_1_1.value;
						(storeName_1 = resItem.storeName),
							(item = resItem.item),
							(instance = resItem.instance);
						store_1 = tx.objectStore(storeName_1);
						id = item.id;
						return [4 /*yield*/, store_1.get(id)];
					case 6:
						opType = _b.sent() === undefined ? OpType.INSERT : OpType.UPDATE;
						if (!(id === model.id)) return [3 /*break*/, 8];
						return [4 /*yield*/, store_1.put(item)];
					case 7:
						_b.sent();
						result.push([instance, opType]);
						return [3 /*break*/, 10];
					case 8:
						if (!(opType === OpType.INSERT)) return [3 /*break*/, 10];
						return [4 /*yield*/, store_1.put(item)];
					case 9:
						_b.sent();
						result.push([instance, opType]);
						_b.label = 10;
					case 10:
						return [3 /*break*/, 4];
					case 11:
						return [3 /*break*/, 18];
					case 12:
						e_1_1 = _b.sent();
						e_1 = { error: e_1_1 };
						return [3 /*break*/, 18];
					case 13:
						_b.trys.push([13, , 16, 17]);
						if (
							!(
								connectionStoreNames_1_1 &&
								!connectionStoreNames_1_1.done &&
								(_a = connectionStoreNames_1.return)
							)
						)
							return [3 /*break*/, 15];
						return [4 /*yield*/, _a.call(connectionStoreNames_1)];
					case 14:
						_b.sent();
						_b.label = 15;
					case 15:
						return [3 /*break*/, 17];
					case 16:
						if (e_1) throw e_1.error;
						return [7 /*endfinally*/];
					case 17:
						return [7 /*endfinally*/];
					case 18:
						return [4 /*yield*/, tx.done];
					case 19:
						_b.sent();
						return [2 /*return*/, result];
				}
			});
		});
	};
	IndexedDBAdapter.prototype.load = function(
		namespaceName,
		srcModelName,
		records
	) {
		var records_1, records_1_1, records_2, records_2_1;
		var e_2, _a, e_3, _b, e_4, _c;
		return __awaiter(this, void 0, void 0, function() {
			var namespace,
				relations,
				connectionStoreNames,
				modelConstructor,
				tx,
				relations_1,
				relations_1_1,
				relation,
				fieldName,
				modelName,
				targetName,
				storeName,
				store,
				modelConstructor_1,
				_d,
				recordItem,
				connectionRecord,
				e_3_1,
				recordItem,
				connectionRecord,
				e_4_1,
				e_2_1;
			var _this = this;
			return __generator(this, function(_e) {
				switch (_e.label) {
					case 0:
						namespace = this.schema.namespaces[namespaceName];
						relations = namespace.relationships[srcModelName].relationTypes;
						connectionStoreNames = relations.map(function(_a) {
							var modelName = _a.modelName;
							return _this.getStorename(namespaceName, modelName);
						});
						modelConstructor = this.getModelConstructorByModelName(
							namespaceName,
							srcModelName
						);
						if (connectionStoreNames.length === 0) {
							return [
								2 /*return*/,
								records.map(function(record) {
									return _this.modelInstanceCreator(modelConstructor, record);
								}),
							];
						}
						tx = this.db.transaction(
							__spreadArrays(connectionStoreNames),
							'readonly'
						);
						_e.label = 1;
					case 1:
						_e.trys.push([1, 34, 35, 40]);
						relations_1 = __asyncValues(relations);
						_e.label = 2;
					case 2:
						return [4 /*yield*/, relations_1.next()];
					case 3:
						if (!((relations_1_1 = _e.sent()), !relations_1_1.done))
							return [3 /*break*/, 33];
						relation = relations_1_1.value;
						(fieldName = relation.fieldName),
							(modelName = relation.modelName),
							(targetName = relation.targetName);
						storeName = this.getStorename(namespaceName, modelName);
						store = tx.objectStore(storeName);
						modelConstructor_1 = this.getModelConstructorByModelName(
							namespaceName,
							modelName
						);
						_d = relation.relationType;
						switch (_d) {
							case 'HAS_ONE':
								return [3 /*break*/, 4];
							case 'BELONGS_TO':
								return [3 /*break*/, 17];
							case 'HAS_MANY':
								return [3 /*break*/, 30];
						}
						return [3 /*break*/, 31];
					case 4:
						_e.trys.push([4, 10, 11, 16]);
						records_1 = __asyncValues(records);
						_e.label = 5;
					case 5:
						return [4 /*yield*/, records_1.next()];
					case 6:
						if (!((records_1_1 = _e.sent()), !records_1_1.done))
							return [3 /*break*/, 9];
						recordItem = records_1_1.value;
						if (!recordItem[fieldName]) return [3 /*break*/, 8];
						return [4 /*yield*/, store.get(recordItem[fieldName])];
					case 7:
						connectionRecord = _e.sent();
						recordItem[fieldName] =
							connectionRecord &&
							this.modelInstanceCreator(modelConstructor_1, connectionRecord);
						_e.label = 8;
					case 8:
						return [3 /*break*/, 5];
					case 9:
						return [3 /*break*/, 16];
					case 10:
						e_3_1 = _e.sent();
						e_3 = { error: e_3_1 };
						return [3 /*break*/, 16];
					case 11:
						_e.trys.push([11, , 14, 15]);
						if (!(records_1_1 && !records_1_1.done && (_b = records_1.return)))
							return [3 /*break*/, 13];
						return [4 /*yield*/, _b.call(records_1)];
					case 12:
						_e.sent();
						_e.label = 13;
					case 13:
						return [3 /*break*/, 15];
					case 14:
						if (e_3) throw e_3.error;
						return [7 /*endfinally*/];
					case 15:
						return [7 /*endfinally*/];
					case 16:
						return [3 /*break*/, 32];
					case 17:
						_e.trys.push([17, 23, 24, 29]);
						records_2 = __asyncValues(records);
						_e.label = 18;
					case 18:
						return [4 /*yield*/, records_2.next()];
					case 19:
						if (!((records_2_1 = _e.sent()), !records_2_1.done))
							return [3 /*break*/, 22];
						recordItem = records_2_1.value;
						if (!recordItem[targetName]) return [3 /*break*/, 21];
						return [4 /*yield*/, store.get(recordItem[targetName])];
					case 20:
						connectionRecord = _e.sent();
						recordItem[fieldName] =
							connectionRecord &&
							this.modelInstanceCreator(modelConstructor_1, connectionRecord);
						delete recordItem[targetName];
						_e.label = 21;
					case 21:
						return [3 /*break*/, 18];
					case 22:
						return [3 /*break*/, 29];
					case 23:
						e_4_1 = _e.sent();
						e_4 = { error: e_4_1 };
						return [3 /*break*/, 29];
					case 24:
						_e.trys.push([24, , 27, 28]);
						if (!(records_2_1 && !records_2_1.done && (_c = records_2.return)))
							return [3 /*break*/, 26];
						return [4 /*yield*/, _c.call(records_2)];
					case 25:
						_e.sent();
						_e.label = 26;
					case 26:
						return [3 /*break*/, 28];
					case 27:
						if (e_4) throw e_4.error;
						return [7 /*endfinally*/];
					case 28:
						return [7 /*endfinally*/];
					case 29:
						return [3 /*break*/, 32];
					case 30:
						// TODO: Lazy loading
						return [3 /*break*/, 32];
					case 31:
						exhaustiveCheck(relation.relationType);
						return [3 /*break*/, 32];
					case 32:
						return [3 /*break*/, 2];
					case 33:
						return [3 /*break*/, 40];
					case 34:
						e_2_1 = _e.sent();
						e_2 = { error: e_2_1 };
						return [3 /*break*/, 40];
					case 35:
						_e.trys.push([35, , 38, 39]);
						if (
							!(
								relations_1_1 &&
								!relations_1_1.done &&
								(_a = relations_1.return)
							)
						)
							return [3 /*break*/, 37];
						return [4 /*yield*/, _a.call(relations_1)];
					case 36:
						_e.sent();
						_e.label = 37;
					case 37:
						return [3 /*break*/, 39];
					case 38:
						if (e_2) throw e_2.error;
						return [7 /*endfinally*/];
					case 39:
						return [7 /*endfinally*/];
					case 40:
						return [
							2 /*return*/,
							records.map(function(record) {
								return _this.modelInstanceCreator(modelConstructor, record);
							}),
						];
				}
			});
		});
	};
	IndexedDBAdapter.prototype.query = function(
		modelConstructor,
		predicate,
		pagination
	) {
		return __awaiter(this, void 0, void 0, function() {
			var storeName,
				namespaceName,
				predicates,
				predicateObjs_1,
				type_1,
				idPredicate,
				id,
				record,
				x,
				all,
				filtered,
				_a,
				_b;
			return __generator(this, function(_c) {
				switch (_c.label) {
					case 0:
						return [4 /*yield*/, this.checkPrivate()];
					case 1:
						_c.sent();
						storeName = this.getStorenameForModel(modelConstructor);
						namespaceName = this.namespaceResolver(modelConstructor);
						if (!predicate) return [3 /*break*/, 8];
						predicates = ModelPredicateCreator.getPredicates(predicate);
						if (!predicates) return [3 /*break*/, 8];
						(predicateObjs_1 = predicates.predicates),
							(type_1 = predicates.type);
						idPredicate =
							predicateObjs_1.length === 1 &&
							predicateObjs_1.find(function(p) {
								return (
									isPredicateObj(p) && p.field === 'id' && p.operator === 'eq'
								);
							});
						if (!idPredicate) return [3 /*break*/, 5];
						id = idPredicate.operand;
						return [4 /*yield*/, this.db.get(storeName, id)];
					case 2:
						record = _c.sent();
						if (!record) return [3 /*break*/, 4];
						return [
							4 /*yield*/,
							this.load(namespaceName, modelConstructor.name, [record]),
						];
					case 3:
						x = _c.sent()[0];
						return [2 /*return*/, [x]];
					case 4:
						return [2 /*return*/, []];
					case 5:
						return [4 /*yield*/, this.db.getAll(storeName)];
					case 6:
						all = _c.sent();
						filtered = predicateObjs_1
							? all.filter(function(m) {
									return validatePredicate(m, type_1, predicateObjs_1);
							  })
							: all;
						return [
							4 /*yield*/,
							this.load(
								namespaceName,
								modelConstructor.name,
								this.inMemoryPagination(filtered, pagination)
							),
						];
					case 7:
						return [2 /*return*/, _c.sent()];
					case 8:
						_a = this.load;
						_b = [namespaceName, modelConstructor.name];
						return [4 /*yield*/, this.enginePagination(storeName, pagination)];
					case 9:
						return [4 /*yield*/, _a.apply(this, _b.concat([_c.sent()]))];
					case 10:
						return [2 /*return*/, _c.sent()];
				}
			});
		});
	};
	IndexedDBAdapter.prototype.inMemoryPagination = function(
		records,
		pagination
	) {
		if (pagination) {
			var _a = pagination.page,
				page = _a === void 0 ? 0 : _a,
				_b = pagination.limit,
				limit = _b === void 0 ? 0 : _b;
			var start = Math.max(0, page * limit) || 0;
			var end = limit > 0 ? start + limit : records.length;
			return records.slice(start, end);
		}
		return records;
	};
	IndexedDBAdapter.prototype.enginePagination = function(
		storeName,
		pagination
	) {
		return __awaiter(this, void 0, void 0, function() {
			var result,
				_a,
				page,
				_b,
				limit,
				initialRecord,
				cursor,
				pageResults,
				hasLimit,
				moreRecords,
				itemsLeft;
			return __generator(this, function(_c) {
				switch (_c.label) {
					case 0:
						if (!pagination) return [3 /*break*/, 7];
						(_a = pagination.page),
							(page = _a === void 0 ? 0 : _a),
							(_b = pagination.limit),
							(limit = _b === void 0 ? 0 : _b);
						initialRecord = Math.max(0, page * limit) || 0;
						return [
							4 /*yield*/,
							this.db
								.transaction(storeName)
								.objectStore(storeName)
								.openCursor(),
						];
					case 1:
						cursor = _c.sent();
						if (!(initialRecord > 0)) return [3 /*break*/, 3];
						return [4 /*yield*/, cursor.advance(initialRecord)];
					case 2:
						_c.sent();
						_c.label = 3;
					case 3:
						pageResults = [];
						hasLimit = typeof limit === 'number' && limit > 0;
						moreRecords = true;
						itemsLeft = limit;
						_c.label = 4;
					case 4:
						if (!(moreRecords && cursor.value)) return [3 /*break*/, 6];
						pageResults.push(cursor.value);
						return [4 /*yield*/, cursor.continue()];
					case 5:
						cursor = _c.sent();
						if (hasLimit) {
							itemsLeft--;
							moreRecords = itemsLeft > 0 && cursor !== null;
						} else {
							moreRecords = cursor !== null;
						}
						return [3 /*break*/, 4];
					case 6:
						result = pageResults;
						return [3 /*break*/, 9];
					case 7:
						return [4 /*yield*/, this.db.getAll(storeName)];
					case 8:
						result = _c.sent();
						_c.label = 9;
					case 9:
						return [2 /*return*/, result];
				}
			});
		});
	};
	IndexedDBAdapter.prototype.queryOne = function(
		modelConstructor,
		firstOrLast
	) {
		if (firstOrLast === void 0) {
			firstOrLast = QueryOne.FIRST;
		}
		return __awaiter(this, void 0, void 0, function() {
			var storeName, cursor, result;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						return [4 /*yield*/, this.checkPrivate()];
					case 1:
						_a.sent();
						storeName = this.getStorenameForModel(modelConstructor);
						return [
							4 /*yield*/,
							this.db
								.transaction([storeName], 'readonly')
								.objectStore(storeName)
								.openCursor(
									undefined,
									firstOrLast === QueryOne.FIRST ? 'next' : 'prev'
								),
						];
					case 2:
						cursor = _a.sent();
						result = cursor ? cursor.value : undefined;
						return [
							2 /*return*/,
							result && this.modelInstanceCreator(modelConstructor, result),
						];
				}
			});
		});
	};
	IndexedDBAdapter.prototype.delete = function(
		modelOrModelConstructor,
		condition
	) {
		return __awaiter(this, void 0, void 0, function() {
			var deleteQueue,
				modelConstructor,
				nameSpace,
				storeName,
				models,
				relations,
				deletedModels,
				deletedModels,
				model,
				modelConstructor,
				nameSpace,
				storeName,
				tx,
				store,
				fromDB,
				predicates,
				predicateObjs,
				type,
				isValid,
				msg,
				relations,
				relations,
				deletedModels;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						return [4 /*yield*/, this.checkPrivate()];
					case 1:
						_a.sent();
						deleteQueue = [];
						if (!isModelConstructor(modelOrModelConstructor))
							return [3 /*break*/, 9];
						modelConstructor = modelOrModelConstructor;
						nameSpace = this.namespaceResolver(modelConstructor);
						storeName = this.getStorenameForModel(modelConstructor);
						return [4 /*yield*/, this.query(modelConstructor, condition)];
					case 2:
						models = _a.sent();
						relations = this.schema.namespaces[nameSpace].relationships[
							modelConstructor.name
						].relationTypes;
						if (!(condition !== undefined)) return [3 /*break*/, 5];
						return [
							4 /*yield*/,
							this.deleteTraverse(
								relations,
								models,
								modelConstructor.name,
								nameSpace,
								deleteQueue
							),
						];
					case 3:
						_a.sent();
						return [4 /*yield*/, this.deleteItem(deleteQueue)];
					case 4:
						_a.sent();
						deletedModels = deleteQueue.reduce(function(acc, _a) {
							var items = _a.items;
							return acc.concat(items);
						}, []);
						return [2 /*return*/, [models, deletedModels]];
					case 5:
						return [
							4 /*yield*/,
							this.deleteTraverse(
								relations,
								models,
								modelConstructor.name,
								nameSpace,
								deleteQueue
							),
						];
					case 6:
						_a.sent();
						// Delete all
						return [
							4 /*yield*/,
							this.db
								.transaction([storeName], 'readwrite')
								.objectStore(storeName)
								.clear(),
						];
					case 7:
						// Delete all
						_a.sent();
						deletedModels = deleteQueue.reduce(function(acc, _a) {
							var items = _a.items;
							return acc.concat(items);
						}, []);
						return [2 /*return*/, [models, deletedModels]];
					case 8:
						return [3 /*break*/, 17];
					case 9:
						model = modelOrModelConstructor;
						modelConstructor = Object.getPrototypeOf(model).constructor;
						nameSpace = this.namespaceResolver(modelConstructor);
						storeName = this.getStorenameForModel(modelConstructor);
						if (!condition) return [3 /*break*/, 13];
						tx = this.db.transaction([storeName], 'readwrite');
						store = tx.objectStore(storeName);
						return [4 /*yield*/, store.get(model.id)];
					case 10:
						fromDB = _a.sent();
						predicates = ModelPredicateCreator.getPredicates(condition);
						(predicateObjs = predicates.predicates), (type = predicates.type);
						isValid = validatePredicate(fromDB, type, predicateObjs);
						if (!isValid) {
							msg = 'Conditional update failed';
							logger.error(msg, { model: fromDB, condition: predicateObjs });
							throw new Error(msg);
						}
						return [4 /*yield*/, tx.done];
					case 11:
						_a.sent();
						relations = this.schema.namespaces[nameSpace].relationships[
							modelConstructor.name
						].relationTypes;
						return [
							4 /*yield*/,
							this.deleteTraverse(
								relations,
								[model],
								modelConstructor.name,
								nameSpace,
								deleteQueue
							),
						];
					case 12:
						_a.sent();
						return [3 /*break*/, 15];
					case 13:
						relations = this.schema.namespaces[nameSpace].relationships[
							modelConstructor.name
						].relationTypes;
						return [
							4 /*yield*/,
							this.deleteTraverse(
								relations,
								[model],
								modelConstructor.name,
								nameSpace,
								deleteQueue
							),
						];
					case 14:
						_a.sent();
						_a.label = 15;
					case 15:
						return [4 /*yield*/, this.deleteItem(deleteQueue)];
					case 16:
						_a.sent();
						deletedModels = deleteQueue.reduce(function(acc, _a) {
							var items = _a.items;
							return acc.concat(items);
						}, []);
						return [2 /*return*/, [[model], deletedModels]];
					case 17:
						return [2 /*return*/];
				}
			});
		});
	};
	IndexedDBAdapter.prototype.deleteItem = function(deleteQueue) {
		var deleteQueue_1, deleteQueue_1_1;
		var e_5, _a, e_6, _b;
		return __awaiter(this, void 0, void 0, function() {
			var connectionStoreNames,
				tx,
				deleteItem,
				storeName,
				items,
				store,
				items_1,
				items_1_1,
				item,
				e_6_1,
				e_5_1;
			return __generator(this, function(_c) {
				switch (_c.label) {
					case 0:
						connectionStoreNames = deleteQueue.map(function(_a) {
							var storeName = _a.storeName;
							return storeName;
						});
						tx = this.db.transaction(
							__spreadArrays(connectionStoreNames),
							'readwrite'
						);
						_c.label = 1;
					case 1:
						_c.trys.push([1, 20, 21, 26]);
						deleteQueue_1 = __asyncValues(deleteQueue);
						_c.label = 2;
					case 2:
						return [4 /*yield*/, deleteQueue_1.next()];
					case 3:
						if (!((deleteQueue_1_1 = _c.sent()), !deleteQueue_1_1.done))
							return [3 /*break*/, 19];
						deleteItem = deleteQueue_1_1.value;
						(storeName = deleteItem.storeName), (items = deleteItem.items);
						store = tx.objectStore(storeName);
						_c.label = 4;
					case 4:
						_c.trys.push([4, 12, 13, 18]);
						items_1 = __asyncValues(items);
						_c.label = 5;
					case 5:
						return [4 /*yield*/, items_1.next()];
					case 6:
						if (!((items_1_1 = _c.sent()), !items_1_1.done))
							return [3 /*break*/, 11];
						item = items_1_1.value;
						if (!item) return [3 /*break*/, 10];
						if (!(typeof item === 'object')) return [3 /*break*/, 8];
						return [4 /*yield*/, store.delete(item['id'])];
					case 7:
						_c.sent();
						_c.label = 8;
					case 8:
						return [4 /*yield*/, store.delete(item.toString())];
					case 9:
						_c.sent();
						_c.label = 10;
					case 10:
						return [3 /*break*/, 5];
					case 11:
						return [3 /*break*/, 18];
					case 12:
						e_6_1 = _c.sent();
						e_6 = { error: e_6_1 };
						return [3 /*break*/, 18];
					case 13:
						_c.trys.push([13, , 16, 17]);
						if (!(items_1_1 && !items_1_1.done && (_b = items_1.return)))
							return [3 /*break*/, 15];
						return [4 /*yield*/, _b.call(items_1)];
					case 14:
						_c.sent();
						_c.label = 15;
					case 15:
						return [3 /*break*/, 17];
					case 16:
						if (e_6) throw e_6.error;
						return [7 /*endfinally*/];
					case 17:
						return [7 /*endfinally*/];
					case 18:
						return [3 /*break*/, 2];
					case 19:
						return [3 /*break*/, 26];
					case 20:
						e_5_1 = _c.sent();
						e_5 = { error: e_5_1 };
						return [3 /*break*/, 26];
					case 21:
						_c.trys.push([21, , 24, 25]);
						if (
							!(
								deleteQueue_1_1 &&
								!deleteQueue_1_1.done &&
								(_a = deleteQueue_1.return)
							)
						)
							return [3 /*break*/, 23];
						return [4 /*yield*/, _a.call(deleteQueue_1)];
					case 22:
						_c.sent();
						_c.label = 23;
					case 23:
						return [3 /*break*/, 25];
					case 24:
						if (e_5) throw e_5.error;
						return [7 /*endfinally*/];
					case 25:
						return [7 /*endfinally*/];
					case 26:
						return [2 /*return*/];
				}
			});
		});
	};
	IndexedDBAdapter.prototype.deleteTraverse = function(
		relations,
		models,
		srcModel,
		nameSpace,
		deleteQueue
	) {
		var relations_2, relations_2_1, models_1, models_1_1, models_2, models_2_1;
		var e_7, _a, e_8, _b, e_9, _c;
		return __awaiter(this, void 0, void 0, function() {
			var rel,
				relationType,
				fieldName,
				modelName,
				storeName,
				_d,
				model,
				index_1,
				recordToDelete,
				e_8_1,
				index,
				model,
				childrenArray,
				e_9_1,
				e_7_1;
			var _this = this;
			return __generator(this, function(_e) {
				switch (_e.label) {
					case 0:
						_e.trys.push([0, 36, 37, 42]);
						relations_2 = __asyncValues(relations);
						_e.label = 1;
					case 1:
						return [4 /*yield*/, relations_2.next()];
					case 2:
						if (!((relations_2_1 = _e.sent()), !relations_2_1.done))
							return [3 /*break*/, 35];
						rel = relations_2_1.value;
						(relationType = rel.relationType),
							(fieldName = rel.fieldName),
							(modelName = rel.modelName);
						storeName = this.getStorename(nameSpace, modelName);
						_d = relationType;
						switch (_d) {
							case 'HAS_ONE':
								return [3 /*break*/, 3];
							case 'HAS_MANY':
								return [3 /*break*/, 17];
							case 'BELONGS_TO':
								return [3 /*break*/, 32];
						}
						return [3 /*break*/, 33];
					case 3:
						_e.trys.push([3, 10, 11, 16]);
						models_1 = __asyncValues(models);
						_e.label = 4;
					case 4:
						return [4 /*yield*/, models_1.next()];
					case 5:
						if (!((models_1_1 = _e.sent()), !models_1_1.done))
							return [3 /*break*/, 9];
						model = models_1_1.value;
						index_1 = getIndex(
							this.schema.namespaces[nameSpace].relationships[modelName]
								.relationTypes,
							srcModel
						);
						return [
							4 /*yield*/,
							this.db
								.transaction(storeName, 'readwrite')
								.objectStore(storeName)
								.index(index_1)
								.get(model.id),
						];
					case 6:
						recordToDelete = _e.sent();
						return [
							4 /*yield*/,
							this.deleteTraverse(
								this.schema.namespaces[nameSpace].relationships[modelName]
									.relationTypes,
								recordToDelete ? [recordToDelete] : [],
								modelName,
								nameSpace,
								deleteQueue
							),
						];
					case 7:
						_e.sent();
						_e.label = 8;
					case 8:
						return [3 /*break*/, 4];
					case 9:
						return [3 /*break*/, 16];
					case 10:
						e_8_1 = _e.sent();
						e_8 = { error: e_8_1 };
						return [3 /*break*/, 16];
					case 11:
						_e.trys.push([11, , 14, 15]);
						if (!(models_1_1 && !models_1_1.done && (_b = models_1.return)))
							return [3 /*break*/, 13];
						return [4 /*yield*/, _b.call(models_1)];
					case 12:
						_e.sent();
						_e.label = 13;
					case 13:
						return [3 /*break*/, 15];
					case 14:
						if (e_8) throw e_8.error;
						return [7 /*endfinally*/];
					case 15:
						return [7 /*endfinally*/];
					case 16:
						return [3 /*break*/, 34];
					case 17:
						index = getIndex(
							this.schema.namespaces[nameSpace].relationships[modelName]
								.relationTypes,
							srcModel
						);
						_e.label = 18;
					case 18:
						_e.trys.push([18, 25, 26, 31]);
						models_2 = __asyncValues(models);
						_e.label = 19;
					case 19:
						return [4 /*yield*/, models_2.next()];
					case 20:
						if (!((models_2_1 = _e.sent()), !models_2_1.done))
							return [3 /*break*/, 24];
						model = models_2_1.value;
						return [
							4 /*yield*/,
							this.db
								.transaction(storeName, 'readwrite')
								.objectStore(storeName)
								.index(index)
								.getAll(model['id']),
						];
					case 21:
						childrenArray = _e.sent();
						return [
							4 /*yield*/,
							this.deleteTraverse(
								this.schema.namespaces[nameSpace].relationships[modelName]
									.relationTypes,
								childrenArray,
								modelName,
								nameSpace,
								deleteQueue
							),
						];
					case 22:
						_e.sent();
						_e.label = 23;
					case 23:
						return [3 /*break*/, 19];
					case 24:
						return [3 /*break*/, 31];
					case 25:
						e_9_1 = _e.sent();
						e_9 = { error: e_9_1 };
						return [3 /*break*/, 31];
					case 26:
						_e.trys.push([26, , 29, 30]);
						if (!(models_2_1 && !models_2_1.done && (_c = models_2.return)))
							return [3 /*break*/, 28];
						return [4 /*yield*/, _c.call(models_2)];
					case 27:
						_e.sent();
						_e.label = 28;
					case 28:
						return [3 /*break*/, 30];
					case 29:
						if (e_9) throw e_9.error;
						return [7 /*endfinally*/];
					case 30:
						return [7 /*endfinally*/];
					case 31:
						return [3 /*break*/, 34];
					case 32:
						// Intentionally blank
						return [3 /*break*/, 34];
					case 33:
						exhaustiveCheck(relationType);
						return [3 /*break*/, 34];
					case 34:
						return [3 /*break*/, 1];
					case 35:
						return [3 /*break*/, 42];
					case 36:
						e_7_1 = _e.sent();
						e_7 = { error: e_7_1 };
						return [3 /*break*/, 42];
					case 37:
						_e.trys.push([37, , 40, 41]);
						if (
							!(
								relations_2_1 &&
								!relations_2_1.done &&
								(_a = relations_2.return)
							)
						)
							return [3 /*break*/, 39];
						return [4 /*yield*/, _a.call(relations_2)];
					case 38:
						_e.sent();
						_e.label = 39;
					case 39:
						return [3 /*break*/, 41];
					case 40:
						if (e_7) throw e_7.error;
						return [7 /*endfinally*/];
					case 41:
						return [7 /*endfinally*/];
					case 42:
						deleteQueue.push({
							storeName: this.getStorename(nameSpace, srcModel),
							items: models.map(function(record) {
								return _this.modelInstanceCreator(
									_this.getModelConstructorByModelName(nameSpace, srcModel),
									record
								);
							}),
						});
						return [2 /*return*/];
				}
			});
		});
	};
	IndexedDBAdapter.prototype.clear = function() {
		return __awaiter(this, void 0, void 0, function() {
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						return [4 /*yield*/, this.checkPrivate()];
					case 1:
						_a.sent();
						this.db.close();
						return [4 /*yield*/, idb.deleteDB(DB_NAME)];
					case 2:
						_a.sent();
						this.db = undefined;
						this.initPromise = undefined;
						return [2 /*return*/];
				}
			});
		});
	};
	return IndexedDBAdapter;
})();
export default new IndexedDBAdapter();
//# sourceMappingURL=indexeddb.js.map
