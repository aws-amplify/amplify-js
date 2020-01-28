'use strict';
/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
var withGoogle_1 = require('./withGoogle');
var withFacebook_1 = require('./withFacebook');
var withAmazon_1 = require('./withAmazon');
var withOAuth_1 = require('./withOAuth');
var withAuth0_1 = require('./withAuth0');
var withGoogle_2 = require('./withGoogle');
exports.withGoogle = withGoogle_2.default;
exports.GoogleButton = withGoogle_2.GoogleButton;
var withFacebook_2 = require('./withFacebook');
exports.withFacebook = withFacebook_2.default;
exports.FacebookButton = withFacebook_2.FacebookButton;
var withAmazon_2 = require('./withAmazon');
exports.withAmazon = withAmazon_2.default;
exports.AmazonButton = withAmazon_2.AmazonButton;
var withOAuth_2 = require('./withOAuth');
exports.withOAuth = withOAuth_2.default;
exports.OAuthButton = withOAuth_2.OAuthButton;
var withAuth0_2 = require('./withAuth0');
exports.withAuth0 = withAuth0_2.default;
exports.Auth0Button = withAuth0_2.Auth0Button;
function withFederated(Comp) {
	var Federated = withAuth0_1.default(
		withOAuth_1.default(
			withAmazon_1.default(withGoogle_1.default(withFacebook_1.default(Comp)))
		)
	);
	return /** @class */ (function(_super) {
		__extends(class_1, _super);
		function class_1() {
			return (_super !== null && _super.apply(this, arguments)) || this;
		}
		class_1.prototype.render = function() {
			// @ts-ignore
			var federated = this.props.federated || {};
			return React.createElement(
				Federated,
				__assign({}, this.props, federated)
			);
		};
		return class_1;
	})(React.Component);
}
exports.withFederated = withFederated;
//# sourceMappingURL=index.js.map
