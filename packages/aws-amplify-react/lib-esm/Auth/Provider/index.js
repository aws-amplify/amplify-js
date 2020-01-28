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
import * as React from 'react';
import withGoogle from './withGoogle';
import withFacebook from './withFacebook';
import withAmazon from './withAmazon';
import withOAuth from './withOAuth';
import withAuth0 from './withAuth0';
export { default as withGoogle, GoogleButton } from './withGoogle';
export { default as withFacebook, FacebookButton } from './withFacebook';
export { default as withAmazon, AmazonButton } from './withAmazon';
export { default as withOAuth, OAuthButton } from './withOAuth';
export { default as withAuth0, Auth0Button } from './withAuth0';
export function withFederated(Comp) {
	var Federated = withAuth0(
		withOAuth(withAmazon(withGoogle(withFacebook(Comp))))
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
//# sourceMappingURL=index.js.map
