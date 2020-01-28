'use strict';
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
Object.defineProperty(exports, '__esModule', { value: true });
var React = require('react');
var core_1 = require('@aws-amplify/core');
var auth_1 = require('@aws-amplify/auth');
var Amplify_UI_Theme_1 = require('../Amplify-UI/Amplify-UI-Theme');
var Amplify_UI_Components_React_1 = require('../Amplify-UI/Amplify-UI-Components-React');
var data_test_attributes_1 = require('../Amplify-UI/data-test-attributes');
var Provider_1 = require('./Provider');
var logger = new core_1.ConsoleLogger('FederatedSignIn');
var FederatedButtons = /** @class */ (function(_super) {
	__extends(FederatedButtons, _super);
	function FederatedButtons() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	FederatedButtons.prototype.google = function(google_client_id) {
		if (!google_client_id) {
			return null;
		}
		var _a = this.props,
			theme = _a.theme,
			onStateChange = _a.onStateChange;
		return React.createElement(Provider_1.GoogleButton, {
			google_client_id: google_client_id,
			theme: theme,
			onStateChange: onStateChange,
		});
	};
	FederatedButtons.prototype.facebook = function(facebook_app_id) {
		if (!facebook_app_id) {
			return null;
		}
		var _a = this.props,
			theme = _a.theme,
			onStateChange = _a.onStateChange;
		return React.createElement(Provider_1.FacebookButton, {
			facebook_app_id: facebook_app_id,
			theme: theme,
			onStateChange: onStateChange,
		});
	};
	FederatedButtons.prototype.amazon = function(amazon_client_id) {
		if (!amazon_client_id) {
			return null;
		}
		var _a = this.props,
			theme = _a.theme,
			onStateChange = _a.onStateChange;
		return React.createElement(Provider_1.AmazonButton, {
			amazon_client_id: amazon_client_id,
			theme: theme,
			onStateChange: onStateChange,
		});
	};
	FederatedButtons.prototype.OAuth = function(oauth_config) {
		if (!oauth_config) {
			return null;
		}
		var _a = this.props,
			theme = _a.theme,
			onStateChange = _a.onStateChange;
		return React.createElement(Provider_1.OAuthButton, {
			label: oauth_config ? oauth_config.label : undefined,
			theme: theme,
			onStateChange: onStateChange,
		});
	};
	FederatedButtons.prototype.auth0 = function(auth0) {
		if (!auth0) {
			return null;
		}
		var _a = this.props,
			theme = _a.theme,
			onStateChange = _a.onStateChange;
		return React.createElement(Provider_1.Auth0Button, {
			label: auth0 ? auth0.label : undefined,
			theme: theme,
			onStateChange: onStateChange,
			auth0: auth0,
		});
	};
	FederatedButtons.prototype.render = function() {
		var authState = this.props.authState;
		if (!['signIn', 'signedOut', 'signedUp'].includes(authState)) {
			return null;
		}
		var federated = this.props.federated || {};
		if (!auth_1.default || typeof auth_1.default.configure !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		// @ts-ignore
		var _a = auth_1.default.configure().oauth,
			oauth = _a === void 0 ? {} : _a;
		// backward compatibility
		if (oauth['domain']) {
			federated.oauth_config = Object.assign({}, federated.oauth_config, oauth);
			// @ts-ignore
		} else if (oauth.awsCognito) {
			// @ts-ignore
			federated.oauth_config = Object.assign(
				{},
				federated.oauth_config,
				// @ts-ignore
				oauth.awsCognito
			);
		}
		// @ts-ignore
		if (oauth.auth0) {
			// @ts-ignore
			federated.auth0 = Object.assign({}, federated.auth0, oauth.auth0);
		}
		if (core_1.JS.isEmpty(federated)) {
			return null;
		}
		var google_client_id = federated.google_client_id,
			facebook_app_id = federated.facebook_app_id,
			amazon_client_id = federated.amazon_client_id,
			oauth_config = federated.oauth_config,
			auth0 = federated.auth0;
		var theme = this.props.theme || Amplify_UI_Theme_1.default;
		return React.createElement(
			'div',
			null,
			React.createElement('div', null, this.google(google_client_id)),
			React.createElement('div', null, this.facebook(facebook_app_id)),
			React.createElement('div', null, this.amazon(amazon_client_id)),
			React.createElement('div', null, this.OAuth(oauth_config)),
			React.createElement('div', null, this.auth0(auth0)),
			React.createElement(
				Amplify_UI_Components_React_1.Strike,
				{ theme: theme },
				core_1.I18n.get('or')
			)
		);
	};
	return FederatedButtons;
})(React.Component);
exports.FederatedButtons = FederatedButtons;
var FederatedSignIn = /** @class */ (function(_super) {
	__extends(FederatedSignIn, _super);
	function FederatedSignIn() {
		return (_super !== null && _super.apply(this, arguments)) || this;
	}
	FederatedSignIn.prototype.render = function() {
		var _a = this.props,
			authState = _a.authState,
			onStateChange = _a.onStateChange;
		var federated = this.props.federated || {};
		if (!auth_1.default || typeof auth_1.default.configure !== 'function') {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		// @ts-ignore
		var _b = auth_1.default.configure().oauth,
			oauth = _b === void 0 ? {} : _b;
		// backward compatibility
		if (oauth['domain']) {
			federated.oauth_config = Object.assign({}, federated.oauth_config, oauth);
			// @ts-ignore
		} else if (oauth.awsCognito) {
			// @ts-ignore
			federated.oauth_config = Object.assign(
				{},
				federated.oauth_config,
				// @ts-ignore
				oauth.awsCognito
			);
		}
		// @ts-ignore
		if (oauth.auth0) {
			// @ts-ignore
			federated.auth0 = Object.assign({}, federated.auth0, oauth.auth0);
		}
		if (!federated) {
			logger.debug('federated prop is empty. show nothing');
			logger.debug(
				'federated={google_client_id: , facebook_app_id: , amazon_client_id}'
			);
			return null;
		}
		// @ts-ignore
		if (!['signIn', 'signedOut', 'signedUp'].includes(authState)) {
			return null;
		}
		logger.debug('federated Config is', federated);
		var theme = this.props.theme || Amplify_UI_Theme_1.default;
		return React.createElement(
			Amplify_UI_Components_React_1.FormSection,
			{
				theme: theme,
				'data-test': data_test_attributes_1.auth.federatedSignIn.section,
			},
			React.createElement(
				Amplify_UI_Components_React_1.SectionBody,
				{
					theme: theme,
					'data-test': data_test_attributes_1.auth.federatedSignIn.bodySection,
				},
				React.createElement(FederatedButtons, {
					federated: federated,
					theme: theme,
					authState: authState,
					onStateChange: onStateChange,
					'data-test':
						data_test_attributes_1.auth.federatedSignIn.signInButtons,
				})
			)
		);
	};
	return FederatedSignIn;
})(React.Component);
exports.default = FederatedSignIn;
//# sourceMappingURL=FederatedSignIn.js.map
