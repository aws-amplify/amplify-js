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
import { isPredicateGroup, isPredicateObj } from './types';
import { v4 as uuid } from 'uuid';
export var exhaustiveCheck = function(obj, throwOnError) {
	if (throwOnError === void 0) {
		throwOnError = true;
	}
	if (throwOnError) {
		throw new Error('Invalid ' + obj);
	}
};
export var validatePredicate = function(model, groupType, predicatesOrGroups) {
	var filterType;
	var isNegation = false;
	switch (groupType) {
		case 'not':
			filterType = 'every';
			isNegation = true;
			break;
		case 'and':
			filterType = 'every';
			break;
		case 'or':
			filterType = 'some';
			break;
		default:
			exhaustiveCheck(groupType);
	}
	if (predicatesOrGroups.length === 0) {
		return true;
	}
	var result = predicatesOrGroups[filterType](function(predicateOrGroup) {
		if (isPredicateObj(predicateOrGroup)) {
			var field = predicateOrGroup.field,
				operator = predicateOrGroup.operator,
				operand = predicateOrGroup.operand;
			var value = model[field];
			return validatePredicateField(value, operator, operand);
		}
		if (isPredicateGroup(predicateOrGroup)) {
			var type = predicateOrGroup.type,
				predicates = predicateOrGroup.predicates;
			return validatePredicate(model, type, predicates);
		}
		throw new Error('Not a predicate or group');
	});
	return isNegation ? !result : result;
};
var validatePredicateField = function(value, operator, operand) {
	switch (operator) {
		case 'ne':
			return value !== operand;
		case 'eq':
			return value === operand;
		case 'le':
			return value <= operand;
		case 'lt':
			return value < operand;
		case 'ge':
			return value >= operand;
		case 'gt':
			return value > operand;
		case 'between':
			var _a = operand,
				min = _a[0],
				max = _a[1];
			return value >= min && value <= max;
		case 'beginsWith':
			return value.startsWith(operand);
		case 'contains':
			return value.indexOf(operand) > -1;
		case 'notContains':
			return value.indexOf(operand) === -1;
		default:
			exhaustiveCheck(operator, false);
			return false;
	}
};
export var isModelConstructor = function(obj) {
	return obj && typeof obj.copyOf === 'function';
};
export var establishRelation = function(namespace) {
	var relationship = {};
	Object.keys(namespace.models).forEach(function(mKey) {
		relationship[mKey] = { indexes: [], relationTypes: [] };
		var model = namespace.models[mKey];
		Object.keys(model.fields).forEach(function(attr) {
			var fieldAttribute = model.fields[attr];
			if (
				typeof fieldAttribute.type === 'object' &&
				'model' in fieldAttribute.type
			) {
				var connectionType = fieldAttribute.association.connectionType;
				relationship[mKey].relationTypes.push({
					fieldName: fieldAttribute.name,
					modelName: fieldAttribute.type.model,
					relationType: connectionType,
					targetName: fieldAttribute.association['targetName'],
				});
				if (connectionType === 'BELONGS_TO') {
					relationship[mKey].indexes.push(
						fieldAttribute.association['targetName']
					);
				}
			}
		});
	});
	return relationship;
};
var topologicallySortedModels = new WeakMap();
export var traverseModel = function(
	srcModelName,
	instance,
	namespace,
	modelInstanceCreator,
	getModelConstructorByModelName
) {
	var relationships = namespace.relationships;
	var modelConstructor = getModelConstructorByModelName(
		namespace.name,
		srcModelName
	);
	var relation = relationships[srcModelName];
	var result = [];
	var newInstance = modelConstructor.copyOf(instance, function(draftInstance) {
		relation.relationTypes.forEach(function(rItem) {
			var modelConstructor = getModelConstructorByModelName(
				namespace.name,
				rItem.modelName
			);
			switch (rItem.relationType) {
				case 'HAS_ONE':
					if (instance[rItem.fieldName]) {
						var modelInstance = void 0;
						try {
							modelInstance = modelInstanceCreator(
								modelConstructor,
								instance[rItem.fieldName]
							);
						} catch (error) {
							// Do nothing
						}
						result.push({
							modelName: rItem.modelName,
							item: instance[rItem.fieldName],
							instance: modelInstance,
						});
						draftInstance[rItem.fieldName] = draftInstance[rItem.fieldName].id;
					}
					break;
				case 'BELONGS_TO':
					if (instance[rItem.fieldName]) {
						var modelInstance = void 0;
						try {
							modelInstance = modelInstanceCreator(
								modelConstructor,
								instance[rItem.fieldName]
							);
						} catch (error) {
							// Do nothing
						}
						var isDeleted = draftInstance[rItem.fieldName]._deleted;
						if (!isDeleted) {
							result.push({
								modelName: rItem.modelName,
								item: instance[rItem.fieldName],
								instance: modelInstance,
							});
						}
					}
					draftInstance[rItem.targetName] = draftInstance[rItem.fieldName]
						? draftInstance[rItem.fieldName].id
						: null;
					delete draftInstance[rItem.fieldName];
					break;
				case 'HAS_MANY':
					// Intentionally blank
					break;
				default:
					exhaustiveCheck(rItem.relationType);
					break;
			}
		});
	});
	result.unshift({
		modelName: srcModelName,
		item: newInstance,
		instance: newInstance,
	});
	if (!topologicallySortedModels.has(namespace)) {
		topologicallySortedModels.set(
			namespace,
			Array.from(namespace.modelTopologicalOrdering.keys())
		);
	}
	var sortedModels = topologicallySortedModels.get(namespace);
	result.sort(function(a, b) {
		return (
			sortedModels.indexOf(a.modelName) - sortedModels.indexOf(b.modelName)
		);
	});
	return result;
};
export var getIndex = function(rel, src) {
	var index = '';
	rel.some(function(relItem) {
		if (relItem.modelName === src) {
			index = relItem.targetName;
		}
	});
	return index;
};
export var NAMESPACES;
(function(NAMESPACES) {
	NAMESPACES['DATASTORE'] = 'datastore';
	NAMESPACES['USER'] = 'user';
	NAMESPACES['SYNC'] = 'sync';
	NAMESPACES['STORAGE'] = 'storage';
})(NAMESPACES || (NAMESPACES = {}));
var DATASTORE = NAMESPACES.DATASTORE;
var USER = NAMESPACES.USER;
var SYNC = NAMESPACES.SYNC;
var STORAGE = NAMESPACES.STORAGE;
export { USER, SYNC, STORAGE, DATASTORE };
var privateModeCheckResult;
export var isPrivateMode = function() {
	return new Promise(function(resolve) {
		var dbname = uuid();
		var db;
		var isPrivate = function() {
			privateModeCheckResult = false;
			resolve(true);
		};
		var isNotPrivate = function() {
			return __awaiter(void 0, void 0, void 0, function() {
				return __generator(this, function(_a) {
					switch (_a.label) {
						case 0:
							if (!(db && db.result && typeof db.result.close === 'function'))
								return [3 /*break*/, 2];
							return [4 /*yield*/, db.result.close()];
						case 1:
							_a.sent();
							_a.label = 2;
						case 2:
							return [4 /*yield*/, indexedDB.deleteDatabase(dbname)];
						case 3:
							_a.sent();
							privateModeCheckResult = true;
							return [2 /*return*/, resolve(false)];
					}
				});
			});
		};
		if (privateModeCheckResult === true) {
			return isNotPrivate();
		}
		if (privateModeCheckResult === false) {
			return isPrivate();
		}
		if (indexedDB === null) return isPrivate();
		db = indexedDB.open(dbname);
		db.onerror = isPrivate;
		db.onsuccess = isNotPrivate;
	});
};
//# sourceMappingURL=util.js.map
