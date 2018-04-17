'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.trackLifecycle = trackLifecycle;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _awsAmplify = require('aws-amplify');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
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

var Default_Track_Events = ['componentDidMount', 'componentDidUpdate', 'compomentWillUnmount', 'compomentDidCatch', 'render'];

function trackLifecycle(Comp, trackerName) {
    var events = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Default_Track_Events;

    return function (_Component) {
        _inherits(WithTrackLifecycle, _Component);

        function WithTrackLifecycle(props) {
            _classCallCheck(this, WithTrackLifecycle);

            var _this = _possibleConstructorReturn(this, (WithTrackLifecycle.__proto__ || Object.getPrototypeOf(WithTrackLifecycle)).call(this, props));

            _this.trackerName = trackerName;
            _this.trackEvents = events;

            _this.track('constructor');
            return _this;
        }

        _createClass(WithTrackLifecycle, [{
            key: 'track',
            value: function track(event) {
                var filtered = this.trackEvents.filter(function (item) {
                    return item === event;
                });
                if (filtered.length > 0) {
                    _awsAmplify.Analytics.record(this.trackerName, { event: event });
                }
            }
        }, {
            key: 'componentWillMount',
            value: function componentWillMount() {
                this.track('componentWillMount');
            }
        }, {
            key: 'componentDidMount',
            value: function componentDidMount() {
                this.track('componentDidMount');
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                this.track('componentWillUnmount');
            }
        }, {
            key: 'componentDidCatch',
            value: function componentDidCatch() {
                this.track('componentDidCatch');
            }
        }, {
            key: 'componentWillReceiveProps',
            value: function componentWillReceiveProps() {
                this.track('componentWillReceiveProps');
            }
        }, {
            key: 'shouldComponentUpdate',
            value: function shouldComponentUpdate() {
                this.track('shouldComponentUpdate');
                return true;
            }
        }, {
            key: 'componentWillUpdate',
            value: function componentWillUpdate() {
                this.track('componentWillUpdate');
            }
        }, {
            key: 'componentDidUpdate',
            value: function componentDidUpdate() {
                this.track('componentDidUpdate');
            }
        }, {
            key: 'setState',
            value: function setState() {
                this.track('setState');
            }
        }, {
            key: 'forceUpdate',
            value: function forceUpdate() {
                this.track('forceUpdate');
            }
        }, {
            key: 'render',
            value: function render() {
                this.track('render');
                return _react2.default.createElement(Comp, this.props);
            }
        }]);

        return WithTrackLifecycle;
    }(_react.Component);
}