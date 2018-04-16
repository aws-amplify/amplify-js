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

var logger = new _awsAmplify.Logger('VerifyContact');

var VerifyContact = function (_AuthPiece) {
    _inherits(VerifyContact, _AuthPiece);

    function VerifyContact(props) {
        _classCallCheck(this, VerifyContact);

        var _this = _possibleConstructorReturn(this, (VerifyContact.__proto__ || Object.getPrototypeOf(VerifyContact)).call(this, props));

        _this._validAuthStates = ['verifyContact'];
        _this.verify = _this.verify.bind(_this);
        _this.submit = _this.submit.bind(_this);

        _this.state = { verifyAttr: null };
        return _this;
    }

    _createClass(VerifyContact, [{
        key: 'verify',
        value: function verify() {
            var _this2 = this;

            var contact = this.inputs.contact;

            if (!contact) {
                this.error('Neither Email nor Phone Number selected');
                return;
            }

            _awsAmplify.Auth.verifyCurrentUserAttribute(contact).then(function (data) {
                logger.debug(data);
                _this2.setState({ verifyAttr: contact });
            }).catch(function (err) {
                return _this2.error(err);
            });
        }
    }, {
        key: 'submit',
        value: function submit() {
            var _this3 = this;

            var attr = this.state.verifyAttr;
            var code = this.inputs.code;

            _awsAmplify.Auth.verifyCurrentUserAttributeSubmit(attr, code).then(function (data) {
                logger.debug(data);
                _this3.changeState('signedIn', _this3.props.authData);
                _this3.setState({ verifyAttr: null });
            }).catch(function (err) {
                return _this3.error(err);
            });
        }
    }, {
        key: 'verifyView',
        value: function verifyView() {
            var user = this.props.authData;
            if (!user) {
                logger.debug('no user for verify');
                return null;
            }
            var unverified = user.unverified;

            if (!unverified) {
                logger.debug('no unverified on user');
                return null;
            }
            var email = unverified.email,
                phone_number = unverified.phone_number;

            var theme = this.props.theme || _AmplifyTheme2.default;
            return _react2.default.createElement(
                'div',
                null,
                email ? _react2.default.createElement(_AmplifyUI.RadioRow, {
                    placeholder: _awsAmplify.I18n.get('Email'),
                    theme: theme,
                    key: 'email',
                    name: 'contact',
                    value: 'email',
                    onChange: this.handleInputChange
                }) : null,
                phone_number ? _react2.default.createElement(_AmplifyUI.RadioRow, {
                    placeholder: _awsAmplify.I18n.get('Phone Number'),
                    theme: theme,
                    key: 'phone_number',
                    name: 'contact',
                    value: 'phone_number',
                    onChange: this.handleInputChange
                }) : null,
                _react2.default.createElement(
                    _AmplifyUI.ButtonRow,
                    { theme: theme, onClick: this.verify },
                    _awsAmplify.I18n.get('Verify')
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
                authData = _props.authData,
                hide = _props.hide;

            if (hide && hide.includes(VerifyContact)) {
                return null;
            }

            return _react2.default.createElement(
                _AmplifyUI.FormSection,
                { theme: theme },
                _react2.default.createElement(
                    _AmplifyUI.SectionHeader,
                    { theme: theme },
                    _awsAmplify.I18n.get('Verify Contact')
                ),
                _react2.default.createElement(
                    _AmplifyUI.SectionBody,
                    { theme: theme },
                    _react2.default.createElement(
                        _AmplifyUI.MessageRow,
                        { theme: theme },
                        _awsAmplify.I18n.get('Account recovery requires verified contact information')
                    ),
                    this.state.verifyAttr ? this.submitView() : this.verifyView()
                ),
                _react2.default.createElement(
                    _AmplifyUI.SectionFooter,
                    { theme: theme },
                    _react2.default.createElement(
                        _AmplifyUI.Link,
                        { theme: theme, onClick: function onClick() {
                                return _this4.changeState('signedIn');
                            } },
                        _awsAmplify.I18n.get('Skip')
                    )
                )
            );
        }
    }]);

    return VerifyContact;
}(_AuthPiece3.default);

exports.default = VerifyContact;