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
import { I18n } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import AmplifyTheme from '../../Amplify-UI/Amplify-UI-Theme';
import { oAuthSignInButton } from '@aws-amplify/ui';
import {
	SignInButton,
	SignInButtonContent,
} from '../../Amplify-UI/Amplify-UI-Components-React';
export default function withOAuth(Comp) {
	return /** @class */ (function(_super) {
		__extends(class_1, _super);
		function class_1(props) {
			var _this = _super.call(this, props) || this;
			_this.signIn = _this.signIn.bind(_this);
			return _this;
		}
		class_1.prototype.signIn = function(_e, provider) {
			Auth.federatedSignIn({ provider: provider });
		};
		class_1.prototype.render = function() {
			return React.createElement(
				Comp,
				__assign({}, this.props, { OAuthSignIn: this.signIn })
			);
		};
		return class_1;
	})(React.Component);
}
var Button = function(props) {
	return React.createElement(
		SignInButton,
		{
			id: oAuthSignInButton,
			onClick: function() {
				return props.OAuthSignIn();
			},
			theme: props.theme || AmplifyTheme,
			variant: 'oAuthSignInButton',
		},
		React.createElement(
			SignInButtonContent,
			{ theme: props.theme || AmplifyTheme },
			I18n.get(props.label || 'Sign in with AWS')
		)
	);
};
export var OAuthButton = withOAuth(Button);
//# sourceMappingURL=withOAuth.js.map
