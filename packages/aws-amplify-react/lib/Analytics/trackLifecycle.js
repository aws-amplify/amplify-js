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
var Default_Track_Events = [
	'componentDidMount',
	'componentDidUpdate',
	'compomentWillUnmount',
	'compomentDidCatch',
	'render',
];
function trackLifecycle(Comp, trackerName, events) {
	if (events === void 0) {
		events = Default_Track_Events;
	}
	return /** @class */ (function(_super) {
		__extends(WithTrackLifecycle, _super);
		function WithTrackLifecycle(props) {
			var _this = _super.call(this, props) || this;
			_this.trackerName = trackerName;
			_this.trackEvents = events;
			_this.track('constructor');
			return _this;
		}
		WithTrackLifecycle.prototype.track = function(event) {
			var filtered = this.trackEvents.filter(function(item) {
				return item === event;
			});
			if (filtered.length > 0) {
				if (
					analytics_1.default &&
					typeof analytics_1.default.record === 'function'
				) {
					analytics_1.default.record({
						name: this.trackerName,
						attributes: { event: event },
					});
				} else {
					throw new Error(
						'No Analytics module found, please ensure @aws-amplify/analytics is imported'
					);
				}
			}
		};
		WithTrackLifecycle.prototype.componentWillMount = function() {
			this.track('componentWillMount');
		};
		WithTrackLifecycle.prototype.componentDidMount = function() {
			this.track('componentDidMount');
		};
		WithTrackLifecycle.prototype.componentWillUnmount = function() {
			this.track('componentWillUnmount');
		};
		WithTrackLifecycle.prototype.componentDidCatch = function() {
			this.track('componentDidCatch');
		};
		WithTrackLifecycle.prototype.componentWillReceiveProps = function() {
			this.track('componentWillReceiveProps');
		};
		WithTrackLifecycle.prototype.shouldComponentUpdate = function() {
			this.track('shouldComponentUpdate');
			return true;
		};
		WithTrackLifecycle.prototype.componentWillUpdate = function() {
			this.track('componentWillUpdate');
		};
		WithTrackLifecycle.prototype.componentDidUpdate = function() {
			this.track('componentDidUpdate');
		};
		WithTrackLifecycle.prototype.setState = function() {
			this.track('setState');
		};
		WithTrackLifecycle.prototype.forceUpdate = function() {
			this.track('forceUpdate');
		};
		WithTrackLifecycle.prototype.render = function() {
			this.track('render');
			return React.createElement(Comp, __assign({}, this.props));
		};
		return WithTrackLifecycle;
	})(react_1.Component);
}
exports.trackLifecycle = trackLifecycle;
//# sourceMappingURL=trackLifecycle.js.map
