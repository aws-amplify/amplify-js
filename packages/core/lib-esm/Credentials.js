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
import { ConsoleLogger as Logger } from './Logger';
import StorageHelper from './StorageHelper';
import { AWS } from './Facet';
import JS from './JS';
import { FacebookOAuth, GoogleOAuth } from './OAuthHelper';
import Amplify from './Amplify';
var logger = new Logger('Credentials');
var Credentials = /** @class */ (function() {
	function Credentials(config) {
		this._gettingCredPromise = null;
		this._refreshHandlers = {};
		this.configure(config);
		this._refreshHandlers['google'] = GoogleOAuth.refreshGoogleToken;
		this._refreshHandlers['facebook'] = FacebookOAuth.refreshFacebookToken;
	}
	Credentials.prototype.getCredSource = function() {
		return this._credentials_source;
	};
	Credentials.prototype.configure = function(config) {
		if (!config) return this._config || {};
		this._config = Object.assign({}, this._config, config);
		var refreshHandlers = this._config.refreshHandlers;
		// If the developer has provided an object of refresh handlers,
		// then we can merge the provided handlers with the current handlers.
		if (refreshHandlers) {
			this._refreshHandlers = __assign(
				__assign({}, this._refreshHandlers),
				refreshHandlers
			);
		}
		this._storage = this._config.storage;
		if (!this._storage) {
			this._storage = new StorageHelper().getStorage();
		}
		this._storageSync = Promise.resolve();
		if (typeof this._storage['sync'] === 'function') {
			this._storageSync = this._storage['sync']();
		}
		return this._config;
	};
	Credentials.prototype.get = function() {
		logger.debug('getting credentials');
		return this._pickupCredentials();
	};
	Credentials.prototype._pickupCredentials = function() {
		logger.debug('picking up credentials');
		if (!this._gettingCredPromise || !this._gettingCredPromise.isPending()) {
			logger.debug('getting new cred promise');
			if (
				AWS.config &&
				AWS.config.credentials &&
				AWS.config.credentials instanceof AWS.Credentials
			) {
				this._gettingCredPromise = JS.makeQuerablePromise(
					this._setCredentialsFromAWS()
				);
			} else {
				this._gettingCredPromise = JS.makeQuerablePromise(this._keepAlive());
			}
		} else {
			logger.debug('getting old cred promise');
		}
		return this._gettingCredPromise;
	};
	Credentials.prototype._keepAlive = function() {
		logger.debug('checking if credentials exists and not expired');
		var cred = this._credentials;
		if (cred && !this._isExpired(cred)) {
			logger.debug('credentials not changed and not expired, directly return');
			return Promise.resolve(cred);
		}
		logger.debug('need to get a new credential or refresh the existing one');
		if (
			Amplify.Auth &&
			typeof Amplify.Auth.currentUserCredentials === 'function'
		) {
			return Amplify.Auth.currentUserCredentials();
		} else {
			return Promise.reject('No Auth module registered in Amplify');
		}
	};
	Credentials.prototype.refreshFederatedToken = function(federatedInfo) {
		var _this = this;
		logger.debug('Getting federated credentials');
		var provider = federatedInfo.provider,
			user = federatedInfo.user;
		var token = federatedInfo.token,
			expires_at = federatedInfo.expires_at,
			identity_id = federatedInfo.identity_id;
		var that = this;
		logger.debug('checking if federated jwt token expired');
		if (expires_at > new Date().getTime()) {
			// if not expired
			logger.debug('token not expired');
			return this._setCredentialsFromFederation({
				provider: provider,
				token: token,
				user: user,
				identity_id: identity_id,
				expires_at: expires_at,
			});
		} else {
			// if refresh handler exists
			if (
				that._refreshHandlers[provider] &&
				typeof that._refreshHandlers[provider] === 'function'
			) {
				logger.debug('getting refreshed jwt token from federation provider');
				return that._refreshHandlers[provider]()
					.then(function(data) {
						logger.debug('refresh federated token sucessfully', data);
						token = data.token;
						identity_id = data.identity_id;
						expires_at = data.expires_at;
						return that._setCredentialsFromFederation({
							provider: provider,
							token: token,
							user: user,
							identity_id: identity_id,
							expires_at: expires_at,
						});
					})
					.catch(function(e) {
						logger.debug('refresh federated token failed', e);
						_this.clear();
						return Promise.reject('refreshing federation token failed: ' + e);
					});
			} else {
				logger.debug('no refresh handler for provider:', provider);
				this.clear();
				return Promise.reject('no refresh handler for provider');
			}
		}
	};
	Credentials.prototype._isExpired = function(credentials) {
		if (!credentials) {
			logger.debug('no credentials for expiration check');
			return true;
		}
		logger.debug('is this credentials expired?', credentials);
		var ts = new Date().getTime();
		var delta = 10 * 60 * 1000; // 10 minutes
		var expired = credentials.expired,
			expireTime = credentials.expireTime;
		if (!expired && expireTime > ts + delta) {
			return false;
		}
		return true;
	};
	Credentials.prototype._setCredentialsForGuest = function() {
		return __awaiter(this, void 0, void 0, function() {
			var attempted,
				_a,
				identityPoolId,
				region,
				mandatorySignIn,
				identityId,
				e_1,
				credentials,
				that;
			var _this = this;
			return __generator(this, function(_b) {
				switch (_b.label) {
					case 0:
						attempted = false;
						logger.debug('setting credentials for guest');
						(_a = this._config),
							(identityPoolId = _a.identityPoolId),
							(region = _a.region),
							(mandatorySignIn = _a.mandatorySignIn);
						if (mandatorySignIn) {
							return [
								2 /*return*/,
								Promise.reject(
									'cannot get guest credentials when mandatory signin enabled'
								),
							];
						}
						if (!identityPoolId) {
							logger.debug('No Cognito Federated Identity pool provided');
							return [
								2 /*return*/,
								Promise.reject('No Cognito Federated Identity pool provided'),
							];
						}
						identityId = undefined;
						_b.label = 1;
					case 1:
						_b.trys.push([1, 3, , 4]);
						return [4 /*yield*/, this._storageSync];
					case 2:
						_b.sent();
						identityId = this._storage.getItem(
							'CognitoIdentityId-' + identityPoolId
						);
						return [3 /*break*/, 4];
					case 3:
						e_1 = _b.sent();
						logger.debug('Failed to get the cached identityId', e_1);
						return [3 /*break*/, 4];
					case 4:
						credentials = new AWS.CognitoIdentityCredentials(
							{
								IdentityPoolId: identityPoolId,
								IdentityId: identityId ? identityId : undefined,
							},
							{
								region: region,
							}
						);
						that = this;
						return [
							2 /*return*/,
							this._loadCredentials(credentials, 'guest', false, null)
								.then(function(res) {
									return res;
								})
								.catch(function(e) {
									return __awaiter(_this, void 0, void 0, function() {
										var newCredentials;
										return __generator(this, function(_a) {
											// If identity id is deleted in the console, we make one attempt to recreate it
											// and remove existing id from cache.
											if (
												e.code === 'ResourceNotFoundException' &&
												e.message ===
													"Identity '" + identityId + "' not found." &&
												!attempted
											) {
												attempted = true;
												logger.debug('Failed to load guest credentials');
												this._storage.removeItem(
													'CognitoIdentityId-' + identityPoolId
												);
												credentials.clearCachedId();
												newCredentials = new AWS.CognitoIdentityCredentials(
													{
														IdentityPoolId: identityPoolId,
														IdentityId: undefined,
													},
													{
														region: region,
													}
												);
												return [
													2 /*return*/,
													this._loadCredentials(
														newCredentials,
														'guest',
														false,
														null
													),
												];
											} else {
												return [2 /*return*/, e];
											}
											return [2 /*return*/];
										});
									});
								}),
						];
				}
			});
		});
	};
	Credentials.prototype._setCredentialsFromAWS = function() {
		var credentials = AWS.config.credentials;
		logger.debug('setting credentials from aws');
		var that = this;
		if (credentials instanceof AWS.Credentials) {
			return Promise.resolve(credentials);
		} else {
			logger.debug(
				'AWS.config.credentials is not an instance of AWS Credentials'
			);
			return Promise.reject(
				'AWS.config.credentials is not an instance of AWS Credentials'
			);
		}
	};
	Credentials.prototype._setCredentialsFromFederation = function(params) {
		var provider = params.provider,
			token = params.token,
			identity_id = params.identity_id,
			user = params.user,
			expires_at = params.expires_at;
		var domains = {
			google: 'accounts.google.com',
			facebook: 'graph.facebook.com',
			amazon: 'www.amazon.com',
			developer: 'cognito-identity.amazonaws.com',
		};
		// Use custom provider url instead of the predefined ones
		var domain = domains[provider] || provider;
		if (!domain) {
			return Promise.reject('You must specify a federated provider');
		}
		var logins = {};
		logins[domain] = token;
		var _a = this._config,
			identityPoolId = _a.identityPoolId,
			region = _a.region;
		if (!identityPoolId) {
			logger.debug('No Cognito Federated Identity pool provided');
			return Promise.reject('No Cognito Federated Identity pool provided');
		}
		var credentials = new AWS.CognitoIdentityCredentials(
			{
				IdentityPoolId: identityPoolId,
				IdentityId: identity_id,
				Logins: logins,
			},
			{
				region: region,
			}
		);
		return this._loadCredentials(credentials, 'federated', true, params);
	};
	Credentials.prototype._setCredentialsFromSession = function(session) {
		logger.debug('set credentials from session');
		var idToken = session.getIdToken().getJwtToken();
		var _a = this._config,
			region = _a.region,
			userPoolId = _a.userPoolId,
			identityPoolId = _a.identityPoolId;
		if (!identityPoolId) {
			logger.debug('No Cognito Federated Identity pool provided');
			return Promise.reject('No Cognito Federated Identity pool provided');
		}
		var key = 'cognito-idp.' + region + '.amazonaws.com/' + userPoolId;
		var logins = {};
		logins[key] = idToken;
		var credentials = new AWS.CognitoIdentityCredentials(
			{
				IdentityPoolId: identityPoolId,
				Logins: logins,
			},
			{
				region: region,
			}
		);
		return this._loadCredentials(credentials, 'userPool', true, null);
	};
	Credentials.prototype._loadCredentials = function(
		credentials,
		source,
		authenticated,
		info
	) {
		var _this = this;
		var that = this;
		var identityPoolId = this._config.identityPoolId;
		return new Promise(function(res, rej) {
			credentials.get(function(err) {
				return __awaiter(_this, void 0, void 0, function() {
					var user, provider, token, expires_at, identity_id, e_2;
					return __generator(this, function(_a) {
						switch (_a.label) {
							case 0:
								if (err) {
									logger.debug('Failed to load credentials', credentials);
									rej(err);
									return [2 /*return*/];
								}
								logger.debug('Load credentials successfully', credentials);
								that._credentials = credentials;
								that._credentials.authenticated = authenticated;
								that._credentials_source = source;
								if (!(source === 'federated')) return [3 /*break*/, 3];
								user = Object.assign(
									{ id: this._credentials.identityId },
									info.user
								);
								(provider = info.provider),
									(token = info.token),
									(expires_at = info.expires_at),
									(identity_id = info.identity_id);
								try {
									this._storage.setItem(
										'aws-amplify-federatedInfo',
										JSON.stringify({
											provider: provider,
											token: token,
											user: user,
											expires_at: expires_at,
											identity_id: identity_id,
										})
									);
								} catch (e) {
									logger.debug(
										'Failed to put federated info into auth storage',
										e
									);
								}
								if (
									!(
										Amplify.Cache && typeof Amplify.Cache.setItem === 'function'
									)
								)
									return [3 /*break*/, 2];
								return [
									4 /*yield*/,
									Amplify.Cache.setItem(
										'federatedInfo',
										{
											provider: provider,
											token: token,
											user: user,
											expires_at: expires_at,
											identity_id: identity_id,
										},
										{ priority: 1 }
									),
								];
							case 1:
								_a.sent();
								return [3 /*break*/, 3];
							case 2:
								logger.debug('No Cache module registered in Amplify');
								_a.label = 3;
							case 3:
								if (!(source === 'guest')) return [3 /*break*/, 7];
								_a.label = 4;
							case 4:
								_a.trys.push([4, 6, , 7]);
								return [4 /*yield*/, this._storageSync];
							case 5:
								_a.sent();
								this._storage.setItem(
									'CognitoIdentityId-' + identityPoolId,
									credentials.identityId
								);
								return [3 /*break*/, 7];
							case 6:
								e_2 = _a.sent();
								logger.debug('Failed to cache identityId', e_2);
								return [3 /*break*/, 7];
							case 7:
								res(that._credentials);
								return [2 /*return*/];
						}
					});
				});
			});
		});
	};
	Credentials.prototype.set = function(params, source) {
		if (source === 'session') {
			return this._setCredentialsFromSession(params);
		} else if (source === 'federation') {
			return this._setCredentialsFromFederation(params);
		} else if (source === 'guest') {
			return this._setCredentialsForGuest();
		} else {
			logger.debug('no source specified for setting credentials');
			return Promise.reject('invalid source');
		}
	};
	Credentials.prototype.clear = function() {
		return __awaiter(this, void 0, void 0, function() {
			var _a, identityPoolId, region, credentials;
			return __generator(this, function(_b) {
				switch (_b.label) {
					case 0:
						(_a = this._config),
							(identityPoolId = _a.identityPoolId),
							(region = _a.region);
						if (identityPoolId) {
							credentials = new AWS.CognitoIdentityCredentials(
								{
									IdentityPoolId: identityPoolId,
								},
								{
									region: region,
								}
							);
							credentials.clearCachedId();
						}
						this._credentials = null;
						this._credentials_source = null;
						this._storage.removeItem('aws-amplify-federatedInfo');
						if (!(Amplify.Cache && typeof Amplify.Cache.setItem === 'function'))
							return [3 /*break*/, 2];
						return [4 /*yield*/, Amplify.Cache.removeItem('federatedInfo')];
					case 1:
						_b.sent();
						return [3 /*break*/, 3];
					case 2:
						logger.debug('No Cache module registered in Amplify');
						_b.label = 3;
					case 3:
						return [2 /*return*/];
				}
			});
		});
	};
	/**
	 * Compact version of credentials
	 * @param {Object} credentials
	 * @return {Object} - Credentials
	 */
	Credentials.prototype.shear = function(credentials) {
		return {
			accessKeyId: credentials.accessKeyId,
			sessionToken: credentials.sessionToken,
			secretAccessKey: credentials.secretAccessKey,
			identityId: credentials.identityId,
			authenticated: credentials.authenticated,
		};
	};
	return Credentials;
})();
export { Credentials };
var instance = new Credentials(null);
export default instance;
//# sourceMappingURL=Credentials.js.map
