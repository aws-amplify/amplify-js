'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _awsAmplify = require('aws-amplify');

var _awsAmplify2 = _interopRequireDefault(_awsAmplify);

var _Greetings = require('./Greetings');

var _Greetings2 = _interopRequireDefault(_Greetings);

var _SignIn = require('./SignIn');

var _SignIn2 = _interopRequireDefault(_SignIn);

var _ConfirmSignIn = require('./ConfirmSignIn');

var _ConfirmSignIn2 = _interopRequireDefault(_ConfirmSignIn);

var _RequireNewPassword = require('./RequireNewPassword');

var _RequireNewPassword2 = _interopRequireDefault(_RequireNewPassword);

var _SignUp = require('./SignUp');

var _SignUp2 = _interopRequireDefault(_SignUp);

var _ConfirmSignUp = require('./ConfirmSignUp');

var _ConfirmSignUp2 = _interopRequireDefault(_ConfirmSignUp);

var _VerifyContact = require('./VerifyContact');

var _VerifyContact2 = _interopRequireDefault(_VerifyContact);

var _ForgotPassword = require('./ForgotPassword');

var _ForgotPassword2 = _interopRequireDefault(_ForgotPassword);

var _TOTPSetup = require('./TOTPSetup');

var _TOTPSetup2 = _interopRequireDefault(_TOTPSetup);

var _AmplifyTheme = require('../AmplifyTheme');

var _AmplifyTheme2 = _interopRequireDefault(_AmplifyTheme);

var _AmplifyUI = require('../AmplifyUI');

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

var logger = new _awsAmplify.Logger('Authenticator');

var Authenticator = function (_Component) {
    _inherits(Authenticator, _Component);

    function Authenticator(props) {
        _classCallCheck(this, Authenticator);

        var _this = _possibleConstructorReturn(this, (Authenticator.__proto__ || Object.getPrototypeOf(Authenticator)).call(this, props));

        _this.handleStateChange = _this.handleStateChange.bind(_this);
        _this.handleAuthEvent = _this.handleAuthEvent.bind(_this);
        _this.errorRenderer = _this.errorRenderer.bind(_this);

        _this.state = { auth: props.authState || 'signIn' };
        return _this;
    }

    _createClass(Authenticator, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var config = this.props.amplifyConfig;
            if (config) {
                _awsAmplify2.default.configure(config);
            }
        }
    }, {
        key: 'handleStateChange',
        value: function handleStateChange(state, data) {
            logger.debug('authenticator state change ' + state, data);
            if (state === this.state.auth) {
                return;
            }

            if (state === 'signedOut') {
                state = 'signIn';
            }
            this.setState({ auth: state, authData: data, error: null });
            if (this.props.onStateChange) {
                this.props.onStateChange(state, data);
            }
        }
    }, {
        key: 'handleAuthEvent',
        value: function handleAuthEvent(state, event) {
            if (event.type === 'error') {
                var map = this.props.errorMessage || _AmplifyMessageMap2.default;
                var message = typeof map === 'string' ? map : map(event.data);
                this.setState({ error: message });
            }
        }
    }, {
        key: 'errorRenderer',
        value: function errorRenderer(err) {
            var theme = this.props.theme || _AmplifyTheme2.default;
            return _react2.default.createElement(
                _AmplifyUI.ErrorSection,
                { theme: theme },
                _react2.default.createElement(
                    _AmplifyUI.SectionBody,
                    { theme: theme },
                    err
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state = this.state,
                auth = _state.auth,
                authData = _state.authData;

            var theme = this.props.theme || _AmplifyTheme2.default;
            var messageMap = this.props.errorMessage || _AmplifyMessageMap2.default;

            var _props = this.props,
                hideDefault = _props.hideDefault,
                hide = _props.hide,
                federated = _props.federated;

            if (!hide) {
                hide = [];
            }
            if (hideDefault) {
                hide = hide.concat([_Greetings2.default, _SignIn2.default, _ConfirmSignIn2.default, _RequireNewPassword2.default, _SignUp2.default, _ConfirmSignUp2.default, _VerifyContact2.default, _ForgotPassword2.default, _TOTPSetup2.default]);
            }
            var props_children = this.props.children || [];
            var default_children = [_react2.default.createElement(_Greetings2.default, null), _react2.default.createElement(_SignIn2.default, { federated: federated }), _react2.default.createElement(_ConfirmSignIn2.default, null), _react2.default.createElement(_RequireNewPassword2.default, null), _react2.default.createElement(_SignUp2.default, null), _react2.default.createElement(_ConfirmSignUp2.default, null), _react2.default.createElement(_VerifyContact2.default, null), _react2.default.createElement(_ForgotPassword2.default, null), _react2.default.createElement(_TOTPSetup2.default, null)];

            var render_props_children = _react2.default.Children.map(props_children, function (child, index) {
                return _react2.default.cloneElement(child, {
                    key: 'aws-amplify-authenticator-props-children-' + index,
                    theme: theme,
                    messageMap: messageMap,
                    authState: auth,
                    authData: authData,
                    onStateChange: _this2.handleStateChange,
                    onAuthEvent: _this2.handleAuthEvent
                });
            });

            var render_default_children = _react2.default.Children.map(default_children, function (child, index) {
                return _react2.default.cloneElement(child, {
                    key: 'aws-amplify-authenticator-default-children-' + index,
                    theme: theme,
                    messageMap: messageMap,
                    authState: auth,
                    authData: authData,
                    onStateChange: _this2.handleStateChange,
                    onAuthEvent: _this2.handleAuthEvent,
                    hide: hide
                });
            });

            var render_children = render_default_children.concat(render_props_children);

            var errorRenderer = this.props.errorRenderer || this.errorRenderer;
            var error = this.state.error;
            return _react2.default.createElement(
                _AmplifyUI.Container,
                { theme: theme },
                render_children,
                error ? errorRenderer(error) : null
            );
        }
    }]);

    return Authenticator;
}(_react.Component);

exports.default = Authenticator;