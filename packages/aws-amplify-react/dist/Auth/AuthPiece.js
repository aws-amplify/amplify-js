'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _awsAmplify = require('aws-amplify');

var _AmplifyTheme = require('../AmplifyTheme');

var _AmplifyTheme2 = _interopRequireDefault(_AmplifyTheme);

var _AmplifyMessageMap = require('../AmplifyMessageMap');

var _AmplifyMessageMap2 = _interopRequireDefault(_AmplifyMessageMap);

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

var logger = new _awsAmplify.Logger('AuthPiece');

var AuthPiece = function (_Component) {
    _inherits(AuthPiece, _Component);

    function AuthPiece(props) {
        _classCallCheck(this, AuthPiece);

        var _this = _possibleConstructorReturn(this, (AuthPiece.__proto__ || Object.getPrototypeOf(AuthPiece)).call(this, props));

        _this.inputs = {};

        _this._isHidden = true;
        _this._validAuthStates = [];
        _this.changeState = _this.changeState.bind(_this);
        _this.error = _this.error.bind(_this);
        _this.handleInputChange = _this.handleInputChange.bind(_this);
        return _this;
    }

    // extract username from authData


    _createClass(AuthPiece, [{
        key: 'usernameFromAuthData',
        value: function usernameFromAuthData() {
            var authData = this.props.authData;

            if (!authData) {
                return '';
            }

            var username = '';
            if ((typeof authData === 'undefined' ? 'undefined' : _typeof(authData)) === 'object') {
                // user object
                username = authData.user ? authData.user.username : authData.username;
            } else {
                username = authData; // username string
            }

            return username;
        }
    }, {
        key: 'errorMessage',
        value: function errorMessage(err) {
            if (typeof err === 'string') {
                return err;
            }
            return err.message ? err.message : JSON.stringify(err);
        }
    }, {
        key: 'triggerAuthEvent',
        value: function triggerAuthEvent(event) {
            var state = this.props.authState;
            if (this.props.onAuthEvent) {
                this.props.onAuthEvent(state, event);
            }
        }
    }, {
        key: 'changeState',
        value: function changeState(state, data) {
            if (this.props.onStateChange) {
                this.props.onStateChange(state, data);
            }

            this.triggerAuthEvent({
                type: 'stateChange',
                data: state
            });
        }
    }, {
        key: 'error',
        value: function error(err) {
            this.triggerAuthEvent({
                type: 'error',
                data: this.errorMessage(err)
            });
        }
    }, {
        key: 'handleInputChange',
        value: function handleInputChange(evt) {
            this.inputs = this.inputs || {};
            var _evt$target = evt.target,
                name = _evt$target.name,
                value = _evt$target.value,
                type = _evt$target.type,
                checked = _evt$target.checked;

            var check_type = ['radio', 'checkbox'].includes(type);
            this.inputs[name] = check_type ? checked : value;
        }
    }, {
        key: 'render',
        value: function render() {
            if (!this._validAuthStates.includes(this.props.authState)) {
                this._isHidden = true;
                return null;
            }

            if (this._isHidden) {
                var track = this.props.track;

                if (track) track();
            }
            this._isHidden = false;

            return this.showComponent(this.props.theme || _AmplifyTheme2.default);
        }
    }, {
        key: 'showComponent',
        value: function showComponent(theme) {
            throw 'You must implement showComponent(theme) and don\'t forget to set this._validAuthStates.';
        }
    }]);

    return AuthPiece;
}(_react.Component);

exports.default = AuthPiece;