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
var react_1 = require('react');
var analytics_1 = require('@aws-amplify/analytics');
function trackUpdate(Comp, trackerName) {
	return /** @class */ (function(_super) {
		__extends(class_1, _super);
		function class_1(props) {
			var _this = _super.call(this, props) || this;
			_this.trackerName = trackerName;
			return _this;
		}
		class_1.prototype.componentDidUpdate = function(prevProps, prevState) {
			var attributes = Object.assign({}, this.props, this.state);
			if (
				analytics_1.default &&
				typeof analytics_1.default.record === 'function'
			) {
				analytics_1.default.record({
					name: this.trackerName,
					attributes: attributes,
				});
			} else {
				throw new Error(
					'No Analytics module found, please ensure @aws-amplify/analytics is imported'
				);
			}
		};
		class_1.prototype.render = function() {
			return React.createElement(Comp, __assign({}, this.props));
		};
		return class_1;
	})(react_1.Component);
}
exports.trackUpdate = trackUpdate;
//# sourceMappingURL=trackUpdate.js.map
