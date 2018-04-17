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

var SignUp = function (_AuthPiece) {
    _inherits(SignUp, _AuthPiece);

    function SignUp(props) {
        _classCallCheck(this, SignUp);

        var _this = _possibleConstructorReturn(this, (SignUp.__proto__ || Object.getPrototypeOf(SignUp)).call(this, props));

        _this._validAuthStates = ['signUp'];
        _this.signUp = _this.signUp.bind(_this);
        return _this;
    }

    _createClass(SignUp, [{
        key: 'signUp',
        value: function signUp() {
            var _this2 = this;

            var _inputs = this.inputs,
                username = _inputs.username,
                password = _inputs.password,
                email = _inputs.email,
                phone_number = _inputs.phone_number;

            _awsAmplify.Auth.signUp(username, password, email, phone_number).then(function () {
                return _this2.changeState('confirmSignUp', username);
            }).catch(function (err) {
                return _this2.error(err);
            });
        }
    }, {
        key: 'showComponent',
        value: function showComponent(theme) {
            var _this3 = this;

            var hide = this.props.hide;

            if (hide && hide.includes(SignUp)) {
                return null;
            }

            return _react2.default.createElement(
                _AmplifyUI.FormSection,
                { theme: theme },
                _react2.default.createElement(
                    _AmplifyUI.SectionHeader,
                    { theme: theme },
                    _awsAmplify.I18n.get('Sign Up Account')
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
                        type: 'password',
                        key: 'password',
                        name: 'password',
                        onChange: this.handleInputChange
                    }),
                    _react2.default.createElement(_AmplifyUI.InputRow, {
                        placeholder: _awsAmplify.I18n.get('Email'),
                        theme: theme,
                        key: 'email',
                        name: 'email',
                        onChange: this.handleInputChange
                    }),
                    _react2.default.createElement(_AmplifyUI.InputRow, {
                        placeholder: _awsAmplify.I18n.get('Phone Number'),
                        theme: theme,
                        key: 'phone_number',
                        name: 'phone_number',
                        onChange: this.handleInputChange
                    }),
                    _react2.default.createElement(
                        _AmplifyUI.ButtonRow,
                        { onClick: this.signUp, theme: theme },
                        _awsAmplify.I18n.get('Sign Up')
                    )
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
                                    return _this3.changeState('confirmSignUp');
                                } },
                            _awsAmplify.I18n.get('Confirm a Code')
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { style: Object.assign({ textAlign: 'right' }, theme.col6) },
                        _react2.default.createElement(
                            _AmplifyUI.Link,
                            { theme: theme, onClick: function onClick() {
                                    return _this3.changeState('signIn');
                                } },
                            _awsAmplify.I18n.get('Sign In')
                        )
                    )
                )
            );
        }
    }]);

    return SignUp;
}(_AuthPiece3.default);

exports.default = SignUp;