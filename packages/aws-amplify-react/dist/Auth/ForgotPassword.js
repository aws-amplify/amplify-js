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

var logger = new _awsAmplify.Logger('ForgotPassword');

var ForgotPassword = function (_AuthPiece) {
    _inherits(ForgotPassword, _AuthPiece);

    function ForgotPassword(props) {
        _classCallCheck(this, ForgotPassword);

        var _this = _possibleConstructorReturn(this, (ForgotPassword.__proto__ || Object.getPrototypeOf(ForgotPassword)).call(this, props));

        _this.send = _this.send.bind(_this);
        _this.submit = _this.submit.bind(_this);

        _this._validAuthStates = ['forgotPassword'];
        _this.state = { delivery: null };
        return _this;
    }

    _createClass(ForgotPassword, [{
        key: 'send',
        value: function send() {
            var _this2 = this;

            var username = this.inputs.username;

            _awsAmplify.Auth.forgotPassword(username).then(function (data) {
                logger.debug(data);
                _this2.setState({ delivery: data.CodeDeliveryDetails });
            }).catch(function (err) {
                return _this2.error(err);
            });
        }
    }, {
        key: 'submit',
        value: function submit() {
            var _this3 = this;

            var _inputs = this.inputs,
                username = _inputs.username,
                code = _inputs.code,
                password = _inputs.password;

            _awsAmplify.Auth.forgotPasswordSubmit(username, code, password).then(function (data) {
                logger.debug(data);
                _this3.changeState('signIn');
                _this3.setState({ delivery: null });
            }).catch(function (err) {
                return _this3.error(err);
            });
        }
    }, {
        key: 'sendView',
        value: function sendView() {
            var theme = this.props.theme || _AmplifyTheme2.default;
            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(_AmplifyUI.InputRow, {
                    autoFocus: true,
                    placeholder: _awsAmplify.I18n.get('Username'),
                    theme: theme,
                    key: 'username',
                    name: 'username',
                    onChange: this.handleInputChange
                }),
                _react2.default.createElement(
                    _AmplifyUI.ButtonRow,
                    { theme: theme, onClick: this.send },
                    _awsAmplify.I18n.get('Send Code')
                )
            );
        }
    }, {
        key: 'submitView',
        value: function submitView() {
            var theme = this.props.theme || _AmplifyTheme2.default;
            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(_AmplifyUI.InputRow, {
                    placeholder: _awsAmplify.I18n.get('Code'),
                    theme: theme,
                    key: 'code',
                    name: 'code',
                    onChange: this.handleInputChange
                }),
                _react2.default.createElement(_AmplifyUI.InputRow, {
                    placeholder: _awsAmplify.I18n.get('New Password'),
                    theme: theme,
                    type: 'password',
                    key: 'password',
                    name: 'password',
                    onChange: this.handleInputChange
                }),
                _react2.default.createElement(
                    _AmplifyUI.ButtonRow,
                    { theme: theme, onClick: this.submit },
                    _awsAmplify.I18n.get('Submit')
                )
            );
        }
    }, {
        key: 'showComponent',
        value: function showComponent(theme) {
            var _this4 = this;

            var _props = this.props,
                authState = _props.authState,
                hide = _props.hide;

            if (hide && hide.includes(ForgotPassword)) {
                return null;
            }

            return _react2.default.createElement(
                _AmplifyUI.FormSection,
                { theme: theme },
                _react2.default.createElement(
                    _AmplifyUI.SectionHeader,
                    { theme: theme },
                    _awsAmplify.I18n.get('Forgot Password')
                ),
                _react2.default.createElement(
                    _AmplifyUI.SectionBody,
                    null,
                    this.state.delivery ? this.submitView() : this.sendView()
                ),
                _react2.default.createElement(
                    _AmplifyUI.SectionFooter,
                    { theme: theme },
                    _react2.default.createElement(
                        _AmplifyUI.Link,
                        { theme: theme, onClick: function onClick() {
                                return _this4.changeState('signIn');
                            } },
                        _awsAmplify.I18n.get('Back to Sign In')
                    )
                )
            );
        }
    }]);

    return ForgotPassword;
}(_AuthPiece3.default);

exports.default = ForgotPassword;