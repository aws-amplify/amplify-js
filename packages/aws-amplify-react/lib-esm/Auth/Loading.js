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
import * as React from 'react';
import { I18n } from '@aws-amplify/core';
import AuthPiece from './AuthPiece';
import {
	FormSection,
	SectionBody,
} from '../Amplify-UI/Amplify-UI-Components-React';
import { auth } from '../Amplify-UI/data-test-attributes';
var Loading = /** @class */ (function(_super) {
	__extends(Loading, _super);
	function Loading(props) {
		var _this = _super.call(this, props) || this;
		_this._validAuthStates = ['loading'];
		return _this;
	}
	Loading.prototype.showComponent = function(theme) {
		var hide = this.props.hide;
		if (hide && hide.includes(Loading)) {
			return null;
		}
		return React.createElement(
			FormSection,
			{ theme: theme, 'data-test': auth.loading.section },
			React.createElement(SectionBody, { theme: theme }, I18n.get('Loading...'))
		);
	};
	return Loading;
})(AuthPiece);
export default Loading;
//# sourceMappingURL=Loading.js.map
