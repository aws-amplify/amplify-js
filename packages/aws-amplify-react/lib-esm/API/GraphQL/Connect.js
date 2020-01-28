var __extends =
	(this && this.__extends) ||
	(function() {
		var extendStatics = function(d, b) {
			extendStatics =
				Object.setPrototypeOf ||
				({ __proto__: [] } instanceof Array &&
					function(d, b) {
						d.__proto__ = b;
					}) ||
				function(d, b) {
					for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
				};
			return extendStatics(d, b);
		};
		return function(d, b) {
			extendStatics(d, b);
			function __() {
				this.constructor = d;
			}
			d.prototype =
				b === null
					? Object.create(b)
					: ((__.prototype = b.prototype), new __());
		};
	})();
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
import { Component } from 'react';
import API from '@aws-amplify/api';
var Connect = /** @class */ (function(_super) {
	__extends(Connect, _super);
	function Connect(props) {
		var _this = _super.call(this, props) || this;
		_this.state = _this.getInitialState();
		_this.subSubscription = null;
		return _this;
	}
	Connect.prototype.getInitialState = function() {
		var query = this.props.query;
		return {
			loading: query && !!query.query,
			data: {},
			errors: [],
			mutation: function() {
				return console.warn('Not implemented');
			},
		};
	};
	Connect.prototype.getDefaultState = function() {
		return {
			loading: false,
			data: {},
			errors: [],
			mutation: function() {
				return console.warn('Not implemented');
			},
		};
	};
	Connect.prototype._fetchData = function() {
		return __awaiter(this, void 0, void 0, function() {
			var _a,
				_b,
				_c,
				query,
				_d,
				variables,
				_e,
				_f,
				mutation,
				_g,
				mutationVariables,
				subscription,
				_h,
				onSubscriptionMsg,
				_j,
				data,
				mutationProp,
				errors,
				hasValidQuery,
				hasValidMutation,
				hasValidSubscription,
				response,
				err_1,
				subsQuery,
				subsVars,
				observable;
			var _this = this;
			return __generator(this, function(_k) {
				switch (_k.label) {
					case 0:
						this._unsubscribe();
						this.setState({ loading: true });
						(_a = this.props),
							(_b = _a.query),
							(_c = _b === void 0 ? {} : _b),
							(query = _c.query),
							(_d = _c.variables),
							(variables = _d === void 0 ? {} : _d),
							(_e = _a.mutation),
							(_f = _e === void 0 ? {} : _e),
							(mutation = _f.query),
							(_g = _f.mutationVariables),
							(mutationVariables = _g === void 0 ? {} : _g),
							(subscription = _a.subscription),
							(_h = _a.onSubscriptionMsg),
							(onSubscriptionMsg =
								_h === void 0
									? function(prevData) {
											return prevData;
									  }
									: _h);
						(_j = this.getDefaultState()),
							(data = _j.data),
							(mutationProp = _j.mutation),
							(errors = _j.errors);
						if (
							!API ||
							typeof API.graphql !== 'function' ||
							typeof API.getGraphqlOperationType !== 'function'
						) {
							throw new Error(
								'No API module found, please ensure @aws-amplify/api is imported'
							);
						}
						hasValidQuery =
							query && API.getGraphqlOperationType(query) === 'query';
						hasValidMutation =
							mutation && API.getGraphqlOperationType(mutation) === 'mutation';
						hasValidSubscription =
							subscription &&
							API.getGraphqlOperationType(subscription.query) ===
								'subscription';
						if (!hasValidQuery && !hasValidMutation && !hasValidSubscription) {
							console.warn('No query, mutation or subscription was specified');
						}
						if (!hasValidQuery) return [3 /*break*/, 4];
						_k.label = 1;
					case 1:
						_k.trys.push([1, 3, , 4]);
						data = null;
						return [
							4 /*yield*/,
							API.graphql({ query: query, variables: variables }),
						];
					case 2:
						response = _k.sent();
						// @ts-ignore
						data = response.data;
						return [3 /*break*/, 4];
					case 3:
						err_1 = _k.sent();
						data = err_1.data;
						errors = err_1.errors;
						return [3 /*break*/, 4];
					case 4:
						if (hasValidMutation) {
							// @ts-ignore
							mutationProp = function(variables) {
								return __awaiter(_this, void 0, void 0, function() {
									var result;
									return __generator(this, function(_a) {
										switch (_a.label) {
											case 0:
												return [
													4 /*yield*/,
													API.graphql({
														query: mutation,
														variables: variables,
													}),
												];
											case 1:
												result = _a.sent();
												this.forceUpdate();
												return [2 /*return*/, result];
										}
									});
								});
							};
						}
						if (hasValidSubscription) {
							(subsQuery = subscription.query),
								(subsVars = subscription.variables);
							try {
								observable = API.graphql({
									query: subsQuery,
									variables: subsVars,
								});
								// @ts-ignore
								this.subSubscription = observable.subscribe({
									next: function(_a) {
										var data = _a.value.data;
										var prevData = _this.state.data;
										// @ts-ignore
										var newData = onSubscriptionMsg(prevData, data);
										if (_this.mounted) {
											_this.setState({ data: newData });
										}
									},
									error: function(err) {
										return console.error(err);
									},
								});
							} catch (err) {
								errors = err.errors;
							}
						}
						this.setState({
							data: data,
							errors: errors,
							mutation: mutationProp,
							loading: false,
						});
						return [2 /*return*/];
				}
			});
		});
	};
	Connect.prototype._unsubscribe = function() {
		if (this.subSubscription) {
			this.subSubscription.unsubscribe();
		}
	};
	Connect.prototype.componentDidMount = function() {
		return __awaiter(this, void 0, void 0, function() {
			return __generator(this, function(_a) {
				this._fetchData();
				this.mounted = true;
				return [2 /*return*/];
			});
		});
	};
	Connect.prototype.componentWillUnmount = function() {
		this._unsubscribe();
		this.mounted = false;
	};
	Connect.prototype.componentDidUpdate = function(prevProps) {
		var loading = this.state.loading;
		var _a = this.props,
			newQueryObj = _a.query,
			newMutationObj = _a.mutation;
		var prevQueryObj = prevProps.query,
			prevMutationObj = prevProps.mutation;
		// query
		// @ts-ignore
		var _b = newQueryObj || {},
			newQuery = _b.query,
			newQueryVariables = _b.variables;
		// @ts-ignore
		var _c = prevQueryObj || {},
			prevQuery = _c.query,
			prevQueryVariables = _c.variables;
		var queryChanged =
			prevQuery !== newQuery ||
			JSON.stringify(prevQueryVariables) !== JSON.stringify(newQueryVariables);
		// mutation
		// @ts-ignore
		var _d = newMutationObj || {},
			newMutation = _d.query,
			newMutationVariables = _d.variables;
		// @ts-ignore
		var _e = prevMutationObj || {},
			prevMutation = _e.query,
			prevMutationVariables = _e.variables;
		var mutationChanged =
			prevMutation !== newMutation ||
			JSON.stringify(prevMutationVariables) !==
				JSON.stringify(newMutationVariables);
		if (!loading && (queryChanged || mutationChanged)) {
			this._fetchData();
		}
	};
	Connect.prototype.render = function() {
		var _a = this.state,
			data = _a.data,
			loading = _a.loading,
			mutation = _a.mutation,
			errors = _a.errors;
		// @ts-ignore
		return (
			this.props.children({
				data: data,
				errors: errors,
				loading: loading,
				mutation: mutation,
			}) || null
		);
	};
	return Connect;
})(Component);
export default Connect;
//# sourceMappingURL=Connect.js.map
