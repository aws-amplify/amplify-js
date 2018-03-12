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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

var logger = new _awsAmplify.Logger('SelectMFAType');

var SelectMFAType = function (_AuthPiece) {
    _inherits(SelectMFAType, _AuthPiece);

    function SelectMFAType(props) {
        _classCallCheck(this, SelectMFAType);

        var _this = _possibleConstructorReturn(this, (SelectMFAType.__proto__ || Object.getPrototypeOf(SelectMFAType)).call(this, props));

        _this._validAuthStates = ['selectMFAType'];
        _this.verify = _this.verify.bind(_this);
        return _this;
    }

    _createClass(SelectMFAType, [{
        key: 'verify',
        value: function () {
            function verify() {
                var _this2 = this;

                var MFAType = this.inputs.MFAType;

                if (!MFAType) {
                    this.error('No mfa type selected');
                    return;
                }

                _awsAmplify.Auth.verifyCurrentUserAttribute(contact).then(function (data) {
                    logger.debug(data);
                })['catch'](function (err) {
                    return _this2.error(err);
                });
            }

            return verify;
        }()
    }, {
        key: 'selectView',
        value: function () {
            function selectView() {
                var MFATypes = this.props.MFATypes;
                var SMS = MFATypes.SMS,
                    TOTP = MFATypes.TOTP,
                    NONE = MFATypes.NONE;

                return _react2['default'].createElement(
                    'div',
                    null,
                    SMS ? _react2['default'].createElement(_AmplifyUI.RadioRow, {
                        placeholder: _awsAmplify.I18n.get('SMS'),
                        theme: theme,
                        key: 'sms',
                        name: 'MFAType',
                        value: 'sms',
                        onChange: this.handleInputChange
                    }) : null,
                    TOTP ? _react2['default'].createElement(_AmplifyUI.RadioRow, {
                        placeholder: _awsAmplify.I18n.get('TOTP'),
                        theme: theme,
                        key: 'totp',
                        name: 'MFAType',
                        value: 'totp',
                        onChange: this.handleInputChange
                    }) : null,
                    NONE ? _react2['default'].createElement(_AmplifyUI.RadioRow, {
                        placeholder: _awsAmplify.I18n.get('No MFA'),
                        theme: theme,
                        key: 'noMFA',
                        name: 'MFAType',
                        value: 'noMFA',
                        onChange: this.handleInputChange
                    }) : null,
                    _react2['default'].createElement(
                        _AmplifyUI.ButtonRow,
                        { theme: theme, onClick: this.verify },
                        _awsAmplify.I18n.get('Verify')
                    )
                );
            }

            return selectView;
        }()
    }, {
        key: 'showComponent',
        value: function () {
            function showComponent(theme) {
                var _this3 = this;

                var _props = this.props,
                    authData = _props.authData,
                    hide = _props.hide;

                if (hide && hide.includes(SelectMFAType)) {
                    return null;
                }

                return _react2['default'].createElement(
                    _AmplifyUI.FormSection,
                    { theme: theme },
                    _react2['default'].createElement(
                        _AmplifyUI.SectionHeader,
                        { theme: theme },
                        _awsAmplify.I18n.get('Select MFA Type')
                    ),
                    _react2['default'].createElement(
                        _AmplifyUI.SectionBody,
                        { theme: theme },
                        _react2['default'].createElement(
                            _AmplifyUI.MessageRow,
                            { theme: theme },
                            _awsAmplify.I18n.get('Select your preferred MFA Type')
                        ),
                        this.selectView()
                    ),
                    _react2['default'].createElement(
                        _AmplifyUI.SectionFooter,
                        { theme: theme },
                        _react2['default'].createElement(
                            _AmplifyUI.Link,
                            { theme: theme, onClick: function () {
                                    function onClick() {
                                        return _this3.changeState('signedIn');
                                    }

                                    return onClick;
                                }() },
                            _awsAmplify.I18n.get('Go back')
                        )
                    )
                );
            }

            return showComponent;
        }()
    }]);

    return SelectMFAType;
}(_AuthPiece3['default']);

exports['default'] = SelectMFAType;