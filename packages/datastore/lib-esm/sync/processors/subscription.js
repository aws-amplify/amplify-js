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
import '@aws-amplify/pubsub';
import Observable from 'zen-observable-ts';
import API, { GRAPHQL_AUTH_MODE } from '@aws-amplify/api';
import Auth from '@aws-amplify/auth';
import Cache from '@aws-amplify/cache';
import { ConsoleLogger as Logger, Hub } from '@aws-amplify/core';
import {
	buildSubscriptionGraphQLOperation,
	getAuthorizationRules,
	TransformerMutationType,
} from '../utils';
var logger = new Logger('DataStore');
export var CONTROL_MSG;
(function(CONTROL_MSG) {
	CONTROL_MSG['CONNECTED'] = 'CONNECTED';
})(CONTROL_MSG || (CONTROL_MSG = {}));
export var USER_CREDENTIALS;
(function(USER_CREDENTIALS) {
	USER_CREDENTIALS[(USER_CREDENTIALS['none'] = 0)] = 'none';
	USER_CREDENTIALS[(USER_CREDENTIALS['unauth'] = 1)] = 'unauth';
	USER_CREDENTIALS[(USER_CREDENTIALS['auth'] = 2)] = 'auth';
})(USER_CREDENTIALS || (USER_CREDENTIALS = {}));
var SubscriptionProcessor = /** @class */ (function() {
	function SubscriptionProcessor(schema) {
		this.schema = schema;
		this.typeQuery = new WeakMap();
		this.buffer = [];
	}
	SubscriptionProcessor.prototype.buildSubscription = function(
		model,
		transformerMutationType,
		userCredentials,
		cognitoTokenPayload,
		oidcTokenPayload
	) {
		var _a =
				this.getAuthorizationInfo(
					model,
					transformerMutationType,
					userCredentials,
					cognitoTokenPayload,
					oidcTokenPayload
				) || {},
			authMode = _a.authMode,
			isOwner = _a.isOwner,
			ownerField = _a.ownerField,
			ownerValue = _a.ownerValue;
		var _b = buildSubscriptionGraphQLOperation(
				model,
				transformerMutationType,
				isOwner,
				ownerField
			),
			opType = _b[0],
			opName = _b[1],
			query = _b[2];
		return {
			authMode: authMode,
			opType: opType,
			opName: opName,
			query: query,
			isOwner: isOwner,
			ownerField: ownerField,
			ownerValue: ownerValue,
		};
	};
	SubscriptionProcessor.prototype.getAuthorizationInfo = function(
		model,
		transformerMutationType,
		userCredentials,
		cognitoTokenPayload,
		oidcTokenPayload
	) {
		if (cognitoTokenPayload === void 0) {
			cognitoTokenPayload = {};
		}
		if (oidcTokenPayload === void 0) {
			oidcTokenPayload = {};
		}
		var result;
		var rules = getAuthorizationRules(model, transformerMutationType);
		// check if has apiKey and public authorization
		var apiKeyAuth = rules.find(function(rule) {
			return rule.authStrategy === 'public' && rule.provider === 'apiKey';
		});
		if (apiKeyAuth) {
			return { authMode: GRAPHQL_AUTH_MODE.API_KEY, isOwner: false };
		}
		// check if has iam authorization
		if (
			userCredentials === USER_CREDENTIALS.unauth ||
			userCredentials === USER_CREDENTIALS.auth
		) {
			var iamPublicAuth = rules.find(function(rule) {
				return rule.authStrategy === 'public' && rule.provider === 'iam';
			});
			if (iamPublicAuth) {
				return { authMode: GRAPHQL_AUTH_MODE.AWS_IAM, isOwner: false };
			}
			var iamPrivateAuth =
				userCredentials === USER_CREDENTIALS.auth &&
				rules.find(function(rule) {
					return rule.authStrategy === 'private' && rule.provider === 'iam';
				});
			if (iamPrivateAuth) {
				return { authMode: GRAPHQL_AUTH_MODE.AWS_IAM, isOwner: false };
			}
		}
		// if not check if has groups authorization and token has groupClaim allowed for cognito token
		var groupAuthRules = rules.filter(function(rule) {
			return rule.authStrategy === 'group' && rule.provider === 'userPools';
		});
		var validCognitoGroup = groupAuthRules.find(function(groupAuthRule) {
			// validate token agains groupClaim
			var userGroups = cognitoTokenPayload[groupAuthRule.groupClaim] || [];
			return userGroups.find(function(userGroup) {
				return groupAuthRule.groups.find(function(group) {
					return group === userGroup;
				});
			});
		});
		if (validCognitoGroup) {
			return {
				authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
				isOwner: false,
			};
		}
		// if not check if has groups authorization and token has groupClaim allowed for oidc token
		groupAuthRules = rules.filter(function(rule) {
			return rule.authStrategy === 'group' && rule.provider === 'oidc';
		});
		var validOidcGroup = groupAuthRules.find(function(groupAuthRule) {
			// validate token agains groupClaim
			var userGroups = oidcTokenPayload[groupAuthRule.groupClaim] || [];
			userGroups.find(function(userGroup) {
				return groupAuthRule.groups.find(function(group) {
					return group === userGroup;
				});
			});
		});
		if (validOidcGroup) {
			return {
				authMode: GRAPHQL_AUTH_MODE.OPENID_CONNECT,
				isOwner: false,
			};
		}
		// check if has owner auth authorization and token ownerField for cognito token
		var ownerAuthRules = rules.filter(function(rule) {
			return rule.authStrategy === 'owner' && rule.provider === 'userPools';
		});
		ownerAuthRules.forEach(function(ownerAuthRule) {
			var ownerValue = cognitoTokenPayload[ownerAuthRule.identityClaim];
			if (ownerValue) {
				result = {
					authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
					isOwner: true,
					ownerField: ownerAuthRule.ownerField,
					ownerValue: ownerValue,
				};
			}
		});
		if (result) {
			return result;
		}
		// check if has owner auth authorization and token ownerField for oidc token
		ownerAuthRules = rules.filter(function(rule) {
			return rule.authStrategy === 'owner' && rule.provider === 'oidc';
		});
		ownerAuthRules.forEach(function(ownerAuthRule) {
			var ownerValue = oidcTokenPayload[ownerAuthRule.identityClaim];
			if (ownerValue) {
				result = {
					authMode: GRAPHQL_AUTH_MODE.OPENID_CONNECT,
					isOwner: true,
					ownerField: ownerAuthRule.ownerField,
					ownerValue: ownerValue,
				};
			}
		});
		if (result) {
			return result;
		}
		return null;
	};
	SubscriptionProcessor.prototype.hubQueryCompletionListener = function(
		completed,
		variables,
		capsule
	) {
		if (variables === capsule.payload.data.variables) {
			completed();
		}
	};
	SubscriptionProcessor.prototype.start = function() {
		var _this = this;
		var ctlObservable = new Observable(function(observer) {
			var promises = [];
			var subscriptions = [];
			var cognitoTokenPayload, oidcTokenPayload;
			var userCredentials = USER_CREDENTIALS.none;
			(function() {
				return __awaiter(_this, void 0, void 0, function() {
					var credentials,
						err_1,
						session,
						err_2,
						federatedInfo,
						token,
						payload,
						err_3;
					var _this = this;
					return __generator(this, function(_a) {
						switch (_a.label) {
							case 0:
								_a.trys.push([0, 2, , 3]);
								return [4 /*yield*/, Auth.currentCredentials()];
							case 1:
								credentials = _a.sent();
								userCredentials = credentials.authenticated
									? USER_CREDENTIALS.auth
									: USER_CREDENTIALS.unauth;
								return [3 /*break*/, 3];
							case 2:
								err_1 = _a.sent();
								return [3 /*break*/, 3];
							case 3:
								_a.trys.push([3, 5, , 6]);
								return [4 /*yield*/, Auth.currentSession()];
							case 4:
								session = _a.sent();
								cognitoTokenPayload = session.getIdToken().decodePayload();
								return [3 /*break*/, 6];
							case 5:
								err_2 = _a.sent();
								return [3 /*break*/, 6];
							case 6:
								_a.trys.push([6, 8, , 9]);
								return [4 /*yield*/, Cache.getItem('federatedInfo')];
							case 7:
								federatedInfo = _a.sent();
								token = federatedInfo.token;
								payload = token.split('.')[1];
								oidcTokenPayload = JSON.parse(
									Buffer.from(payload, 'base64').toString('utf8')
								);
								return [3 /*break*/, 9];
							case 8:
								err_3 = _a.sent();
								return [3 /*break*/, 9];
							case 9:
								Object.values(this.schema.namespaces).forEach(function(
									namespace
								) {
									Object.values(namespace.models)
										.filter(function(_a) {
											var syncable = _a.syncable;
											return syncable;
										})
										.forEach(function(modelDefinition) {
											return __awaiter(_this, void 0, void 0, function() {
												var queriesMetadata;
												var _this = this;
												return __generator(this, function(_a) {
													queriesMetadata = [
														TransformerMutationType.CREATE,
														TransformerMutationType.UPDATE,
														TransformerMutationType.DELETE,
													].map(function(op) {
														return _this.buildSubscription(
															modelDefinition,
															op,
															userCredentials,
															cognitoTokenPayload,
															oidcTokenPayload
														);
													});
													queriesMetadata.forEach(function(_a) {
														var transformerMutationType = _a.opType,
															opName = _a.opName,
															query = _a.query,
															isOwner = _a.isOwner,
															ownerField = _a.ownerField,
															ownerValue = _a.ownerValue,
															authMode = _a.authMode;
														return __awaiter(_this, void 0, void 0, function() {
															var marker, queryObservable;
															var _this = this;
															return __generator(this, function(_b) {
																marker = {};
																if (isOwner) {
																	if (!ownerValue) {
																		// Check if there is an owner field, check where this error should be located
																		observer.error(
																			'Owner field required, sign in is needed in order to perform this operation'
																		);
																		return [2 /*return*/];
																	}
																	marker[ownerField] = ownerValue;
																}
																queryObservable = API.graphql(
																	__assign(
																		{ query: query, variables: marker },
																		{ authMode: authMode }
																	)
																);
																subscriptions.push(
																	queryObservable
																		.map(function(_a) {
																			var value = _a.value;
																			return value;
																		})
																		.subscribe({
																			next: function(_a) {
																				var data = _a.data,
																					errors = _a.errors;
																				if (
																					Array.isArray(errors) &&
																					errors.length > 0
																				) {
																					var messages = errors.map(function(
																						_a
																					) {
																						var message = _a.message;
																						return message;
																					});
																					logger.warn(
																						'Skipping incoming subscription. Messages: ' +
																							messages.join('\n')
																					);
																					_this.drainBuffer();
																					return;
																				}
																				var _b = opName,
																					record = data[_b];
																				_this.pushToBuffer(
																					transformerMutationType,
																					modelDefinition,
																					record
																				);
																				_this.drainBuffer();
																			},
																			error: function(subscriptionError) {
																				var _a = subscriptionError.error,
																					_b = (_a === void 0
																						? {
																								errors: [],
																						  }
																						: _a
																					).errors[0],
																					_c = (_b === void 0 ? {} : _b)
																						.message,
																					message = _c === void 0 ? '' : _c;
																				observer.error(message);
																			},
																		})
																);
																promises.push(
																	(function() {
																		return __awaiter(
																			_this,
																			void 0,
																			void 0,
																			function() {
																				var boundFunction;
																				var _this = this;
																				return __generator(this, function(_a) {
																					switch (_a.label) {
																						case 0:
																							return [
																								4 /*yield*/,
																								new Promise(function(res) {
																									boundFunction = _this.hubQueryCompletionListener.bind(
																										_this,
																										res,
																										marker
																									);
																									Hub.listen(
																										'api',
																										boundFunction
																									);
																								}),
																							];
																						case 1:
																							_a.sent();
																							Hub.remove('api', boundFunction);
																							return [2 /*return*/];
																					}
																				});
																			}
																		);
																	})()
																);
																return [2 /*return*/];
															});
														});
													});
													return [2 /*return*/];
												});
											});
										});
								});
								Promise.all(promises).then(function() {
									return observer.next(CONTROL_MSG.CONNECTED);
								});
								return [2 /*return*/];
						}
					});
				});
			})();
			return function() {
				subscriptions.forEach(function(subscription) {
					return subscription.unsubscribe();
				});
			};
		});
		var dataObservable = new Observable(function(observer) {
			_this.dataObserver = observer;
			_this.drainBuffer();
			return function() {
				_this.dataObserver = null;
			};
		});
		return [ctlObservable, dataObservable];
	};
	SubscriptionProcessor.prototype.pushToBuffer = function(
		transformerMutationType,
		modelDefinition,
		data
	) {
		this.buffer.push([transformerMutationType, modelDefinition, data]);
	};
	SubscriptionProcessor.prototype.drainBuffer = function() {
		var _this = this;
		if (this.dataObserver) {
			this.buffer.forEach(function(data) {
				return _this.dataObserver.next(data);
			});
			this.buffer = [];
		}
	};
	return SubscriptionProcessor;
})();
export { SubscriptionProcessor };
//# sourceMappingURL=subscription.js.map
