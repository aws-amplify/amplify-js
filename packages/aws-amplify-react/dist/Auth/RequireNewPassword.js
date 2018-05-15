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

var logger = new _awsAmplify.Logger('RequireNewPassword');

var RequireNewPassword = function (_AuthPiece) {
    _inherits(RequireNewPassword, _AuthPiece);

    function RequireNewPassword(props) {
        _classCallCheck(this, RequireNewPassword);

        var _this = _possibleConstructorReturn(this, (RequireNewPassword.__proto__ || Object.getPrototypeOf(RequireNewPassword)).call(this, props));

        _this._validAuthStates = ['requireNewPassword'];
        _this.change = _this.change.bind(_this);
        return _this;
    }

    _createClass(RequireNewPassword, [{
        key: 'change',
        value: function change() {
            var _this2 = this;

            var user = this.props.authData;
            var password = this.inputs.password;
            var requiredAttributes = user.challengeParam.requiredAttributes;

            _awsAmplify.Auth.completeNewPassword(user, password, requiredAttributes).then(function (user) {
                logger.debug('complete new password', user);
                if (user.challengeName === 'SMS_MFA') {
                    _this2.changeState('confirmSignIn', user);
                } else if (user.challengeName === 'MFA_SETUP') {
                    logger.debug('TOTP setup', user.challengeParam);
                    _this2.changeState('TOTPSetup', user);
                } else {
                    _this2.changeState('signedIn', user);
                }
            }).catch(function (err) {
                return _this2.error(err);
            });
        }
    }, {
        key: 'showComponent',
        value: function showComponent(theme) {
            var _this3 = this;

            var hide = this.props.hide;

            if (hide && hide.includes(RequireNewPassword)) {
                return null;
            }

            return _react2.default.createElement(
                _AmplifyUI.FormSection,
                { theme: theme },
                _react2.default.createElement(
                    _AmplifyUI.SectionHeader,
                    { theme: theme },
                    _awsAmplify.I18n.get('Change Password')
                ),
                _react2.default.createElement(
                    _AmplifyUI.SectionBody,
                    null,
                    _react2.default.createElement(_AmplifyUI.InputRow, {
                        autoFocus: true,
                        placeholder: _awsAmplify.I18n.get('New Password'),
                        theme: theme,
                        key: 'password',
                        name: 'password',
                        type: 'password',
                        onChange: this.handleInputChange
                    }),
                    _react2.default.createElement(
                        _AmplifyUI.ButtonRow,
                        { theme: theme, onClick: this.change },
                        _awsAmplify.I18n.get('Change')
                    )
                ),
                _react2.default.createElement(
                    _AmplifyUI.SectionFooter,
                    { theme: theme },
                    _react2.default.createElement(
                        _AmplifyUI.Link,
                        { theme: theme, onClick: function onClick() {
                                return _this3.changeState('signIn');
                            } },
                        _awsAmplify.I18n.get('Back to Sign In')
                    )
                )
            );
        }
    }]);

    return RequireNewPassword;
}(_AuthPiece3.default);

exports.default = RequireNewPassword;