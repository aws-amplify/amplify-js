'use strict';
/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
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
Object.defineProperty(exports, '__esModule', { value: true });
var React = require('react');
var core_1 = require('@aws-amplify/core');
var auth_1 = require('@aws-amplify/auth');
var AuthPiece_1 = require('./AuthPiece');
var TOTPSetupComp_1 = require('../Widget/TOTPSetupComp');
var data_test_attributes_1 = require('../Amplify-UI/data-test-attributes');
var logger = new core_1.ConsoleLogger('TOTPSetup');
var TOTPSetup = /** @class */ (function(_super) {
	__extends(TOTPSetup, _super);
	function TOTPSetup(props) {
		var _this = _super.call(this, props) || this;
		_this._validAuthStates = ['TOTPSetup'];
		_this.onTOTPEvent = _this.onTOTPEvent.bind(_this);
		_this.checkContact = _this.checkContact.bind(_this);
		return _this;
	}
	TOTPSetup.prototype.checkContact = function(user) {
		var _this = this;
		if (
			!auth_1.default ||
			typeof auth_1.default.verifiedContact !== 'function'
		) {
			throw new Error(
				'No Auth module found, please ensure @aws-amplify/auth is imported'
			);
		}
		auth_1.default.verifiedContact(user).then(function(data) {
			if (!core_1.JS.isEmpty(data.verified)) {
				_this.changeState('signedIn', user);
			} else {
				var newUser = Object.assign(user, data);
				_this.changeState('verifyContact', newUser);
			}
		});
	};
	TOTPSetup.prototype.onTOTPEvent = function(event, data, user) {
		logger.debug('on totp event', event, data);
		// const user = this.props.authData;
		if (event === 'Setup TOTP') {
			if (data === 'SUCCESS') {
				this.checkContact(user);
			}
		}
	};
	TOTPSetup.prototype.showComponent = function(theme) {
		var hide = this.props.hide;
		if (hide && hide.includes(TOTPSetup)) {
			return null;
		}
		return React.createElement(
			TOTPSetupComp_1.default,
			__assign({}, this.props, {
				onTOTPEvent: this.onTOTPEvent,
				'data-test': data_test_attributes_1.auth.TOTPSetup.component,
			})
		);
	};
	return TOTPSetup;
})(AuthPiece_1.default);
exports.default = TOTPSetup;
//# sourceMappingURL=TOTPSetup.js.map
