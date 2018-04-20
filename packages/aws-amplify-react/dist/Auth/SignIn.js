'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _awsAmplify = require('aws-amplify');

var _AuthPiece2 = require('./AuthPiece');

var _AuthPiece3 = _interopRequireDefault(_AuthPiece2);

var _FederatedSignIn = require('./FederatedSignIn');

var _AmplifyTheme = require('../AmplifyTheme');

var _AmplifyTheme2 = _interopRequireDefault(_AmplifyTheme);

var _AmplifyUI = require('../AmplifyUI');

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

var logger = new _awsAmplify.Logger('SignIn');

var SignIn = function (_AuthPiece) {
    _inherits(SignIn, _AuthPiece);

    function SignIn(props) {
        _classCallCheck(this, SignIn);

        var _this = _possibleConstructorReturn(this, (SignIn.__proto__ || Object.getPrototypeOf(SignIn)).call(this, props));

        _this.checkContact = _this.checkContact.bind(_this);
        _this.signIn = _this.signIn.bind(_this);

        _this._validAuthStates = ['signIn', 'signedOut', 'signedUp'];
        _this.state = {};
        return _this;
    }

    _createClass(SignIn, [{
        key: 'checkContact',
        value: function checkContact(user) {
            var _this2 = this;

            _awsAmplify.Auth.verifiedContact(user).then(function (data) {
                if (!_awsAmplify.JS.isEmpty(data.verified)) {
                    _this2.changeState('signedIn', user);
                } else {
                    user = Object.assign(user, data);
                    _this2.changeState('verifyContact', user);
                }
            });
        }
    }, {
        key: 'signIn',
        value: function signIn() {
            var _this3 = this;

            var _inputs = this.inputs,
                username = _inputs.username,
                password = _inputs.password;

            _awsAmplify.Auth.signIn(username, password).then(function (user) {
                logger.debug(user);
                if (user.challengeName === 'SMS_MFA' || user.challengeName === 'SOFTWARE_TOKEN_MFA') {
                    logger.debug('confirm user with ' + user.challengeName);
                    _this3.changeState('confirmSignIn', user);
                } else if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
                    logger.debug('require new password', user.challengeParam);
                    _this3.changeState('requireNewPassword', user);
                } else if (user.challengeName === 'MFA_SETUP') {
                    logger.debug('TOTP setup', user.challengeParam);
                    _this3.changeState('TOTPSetup', user);
                } else {
                    _this3.checkContact(user);
                }
            }).catch(function (err) {
                _this3.error(err);
            });
        }
    }, {
        key: 'showComponent',
        value: function showComponent(theme) {
            var _this4 = this;

            var _props = this.props,
                authState = _props.authState,
                hide = _props.hide,
                federated = _props.federated,
                onStateChange = _props.onStateChange;

            if (hide && hide.includes(SignIn)) {
                return null;
            }

            return _react2.default.createElement(
                _AmplifyUI.FormSection,
                { theme: theme },
                _react2.default.createElement(
                    _AmplifyUI.SectionHeader,
                    { theme: theme },
                    _awsAmplify.I18n.get('Sign In Account')
                ),
                _react2.default.createElement(
                    _AmplifyUI.SectionBody,
                    { theme: theme },
                    _react2.default.createElement(_AmplifyUI.InputRow, {
                        autoFocus: true,
                        placeholder: _awsAmplify.I18n.get('Username'),
                        theme: theme,
                        key: 'username',
                        name: 'username',
                        onChange: this.handleInputChange
                    }),
                    _react2.default.createElement(_AmplifyUI.InputRow, {
                        placeholder: _awsAmplify.I18n.get('Password'),
                        theme: theme,
                        key: 'password',
                        type: 'password',
                        name: 'password',
                        onChange: this.handleInputChange
                    }),
                    _react2.default.createElement(
                        _AmplifyUI.ButtonRow,
                        { theme: theme, onClick: this.signIn },
                        _awsAmplify.I18n.get('Sign In')
                    ),
                    _react2.default.createElement(_FederatedSignIn.FederatedButtons, {
                        federated: federated,
                        theme: theme,
                        authState: authState,
                        onStateChange: onStateChange
                    })
                ),
                _react2.default.createElement(
                    _AmplifyUI.SectionFooter,
                    { theme: theme },
                    _react2.default.createElement(
                        'div',
                        { style: theme.col6 },
                        _react2.default.createElement(
                            _AmplifyUI.Link,
                            { theme: theme, onClick: function onClick() {
                                    return _this4.changeState('forgotPassword');
                                } },
                            _awsAmplify.I18n.get('Forgot Password')
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { style: Object.assign({ textAlign: 'right' }, theme.col6) },
                        _react2.default.createElement(
                            _AmplifyUI.Link,
                            { theme: theme, onClick: function onClick() {
                                    return _this4.changeState('signUp');
                                } },
                            _awsAmplify.I18n.get('Sign Up')
                        )
                    )
                )
            );
        }
    }]);

    return SignIn;
}(_AuthPiece3.default);

exports.default = SignIn;