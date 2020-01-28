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
var predicates_1 = require('../predicates');
var types_1 = require('../types');
var util_1 = require('../util');
var utils_1 = require('./utils');
// TODO: Persist deleted ids
var MutationEventOutbox = /** @class */ (function() {
	function MutationEventOutbox(
		schema,
		namespaceResolver,
		MutationEvent,
		ownSymbol
	) {
		this.schema = schema;
		this.namespaceResolver = namespaceResolver;
		this.MutationEvent = MutationEvent;
		this.ownSymbol = ownSymbol;
	}
	MutationEventOutbox.prototype.enqueue = function(storage, mutationEvent) {
		return __awaiter(this, void 0, void 0, function() {
			var mutationEventModelDefinition,
				predicate,
				first,
				incomingMutationType,
				incomingConditionJSON,
				incomingCondition;
			var _this = this;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						mutationEventModelDefinition = this.schema.namespaces[util_1.SYNC]
							.models['MutationEvent'];
						predicate = predicates_1.ModelPredicateCreator.createFromExisting(
							mutationEventModelDefinition,
							function(c) {
								return c
									.modelId('eq', mutationEvent.modelId)
									.id('ne', _this.inProgressMutationEventId);
							}
						);
						return [4 /*yield*/, storage.query(this.MutationEvent, predicate)];
					case 1:
						first = _a.sent()[0];
						if (!(first === undefined)) return [3 /*break*/, 3];
						return [
							4 /*yield*/,
							storage.save(mutationEvent, undefined, this.ownSymbol),
						];
					case 2:
						_a.sent();
						return [2 /*return*/];
					case 3:
						incomingMutationType = mutationEvent.operation;
						if (!(first.operation === utils_1.TransformerMutationType.CREATE))
							return [3 /*break*/, 8];
						if (
							!(incomingMutationType === utils_1.TransformerMutationType.DELETE)
						)
							return [3 /*break*/, 5];
						// delete all for model
						return [4 /*yield*/, storage.delete(this.MutationEvent, predicate)];
					case 4:
						// delete all for model
						_a.sent();
						return [3 /*break*/, 7];
					case 5:
						// first gets updated with incoming's data, condition intentionally skiped
						return [
							4 /*yield*/,
							storage.save(
								this.MutationEvent.copyOf(first, function(draft) {
									draft.data = mutationEvent.data;
								}),
								undefined,
								this.ownSymbol
							),
						];
					case 6:
						// first gets updated with incoming's data, condition intentionally skiped
						_a.sent();
						_a.label = 7;
					case 7:
						return [3 /*break*/, 12];
					case 8:
						incomingConditionJSON = mutationEvent.condition;
						incomingCondition = JSON.parse(incomingConditionJSON);
						if (!(Object.keys(incomingCondition).length === 0))
							return [3 /*break*/, 10];
						// delete all for model
						return [4 /*yield*/, storage.delete(this.MutationEvent, predicate)];
					case 9:
						// delete all for model
						_a.sent();
						_a.label = 10;
					case 10:
						// Enqueue new one
						return [
							4 /*yield*/,
							storage.save(mutationEvent, undefined, this.ownSymbol),
						];
					case 11:
						// Enqueue new one
						_a.sent();
						_a.label = 12;
					case 12:
						return [2 /*return*/];
				}
			});
		});
	};
	MutationEventOutbox.prototype.dequeue = function(storage) {
		return __awaiter(this, void 0, void 0, function() {
			var head;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						return [4 /*yield*/, this.peek(storage)];
					case 1:
						head = _a.sent();
						return [4 /*yield*/, storage.delete(head)];
					case 2:
						_a.sent();
						this.inProgressMutationEventId = undefined;
						return [2 /*return*/, head];
				}
			});
		});
	};
	/**
	 * Doing a peek() implies that the mutation goes "inProgress"
	 *
	 * @param storage
	 */
	MutationEventOutbox.prototype.peek = function(storage) {
		return __awaiter(this, void 0, void 0, function() {
			var head;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						return [
							4 /*yield*/,
							storage.queryOne(this.MutationEvent, types_1.QueryOne.FIRST),
						];
					case 1:
						head = _a.sent();
						this.inProgressMutationEventId = head ? head.id : undefined;
						return [2 /*return*/, head];
				}
			});
		});
	};
	MutationEventOutbox.prototype.getForModel = function(storage, model) {
		return __awaiter(this, void 0, void 0, function() {
			var mutationEventModelDefinition, mutationEvents;
			return __generator(this, function(_a) {
				switch (_a.label) {
					case 0:
						mutationEventModelDefinition = this.schema.namespaces[util_1.SYNC]
							.models.MutationEvent;
						return [
							4 /*yield*/,
							storage.query(
								this.MutationEvent,
								predicates_1.ModelPredicateCreator.createFromExisting(
									mutationEventModelDefinition,
									function(c) {
										return c.modelId('eq', model.id);
									}
								)
							),
						];
					case 1:
						mutationEvents = _a.sent();
						return [2 /*return*/, mutationEvents];
				}
			});
		});
	};
	return MutationEventOutbox;
})();
exports.MutationEventOutbox = MutationEventOutbox;
//# sourceMappingURL=outbox.js.map
