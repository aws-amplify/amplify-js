'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _awsAmplify = require('aws-amplify');

var _AmplifyTheme = require('../AmplifyTheme');

var _AmplifyTheme2 = _interopRequireDefault(_AmplifyTheme);

var _AmplifyUI = require('../AmplifyUI');

var _TOTPSetupComp = require('./TOTPSetupComp');

var _TOTPSetupComp2 = _interopRequireDefault(_TOTPSetupComp);

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

var logger = new _awsAmplify.Logger('SelectMFAType');

var SelectMFAType = function (_Component) {
    _inherits(SelectMFAType, _Component);

    function SelectMFAType(props) {
        _classCallCheck(this, SelectMFAType);

        var _this = _possibleConstructorReturn(this, (SelectMFAType.__proto__ || Object.getPrototypeOf(SelectMFAType)).call(this, props));

        _this.verify = _this.verify.bind(_this);
        _this.handleInputChange = _this.handleInputChange.bind(_this);

        _this.state = {
            TOTPSetup: false,
            selectMessage: null
        };
        return _this;
    }

    _createClass(SelectMFAType, [{
        key: 'handleInputChange',
        value: function handleInputChange(evt) {
            // clear current state
            this.setState({
                TOTPSetup: false,
                selectMessage: null
            });
            this.inputs = {};
            var _evt$target = evt.target,
                name = _evt$target.name,
                value = _evt$target.value,
                type = _evt$target.type,
                checked = _evt$target.checked;

            var check_type = ['radio', 'checkbox'].includes(type);
            this.inputs[value] = check_type ? checked : value;
        }
    }, {
        key: 'verify',
        value: function verify() {
            var _this2 = this;

            logger.debug('mfatypes inputs', this.inputs);
            if (!this.inputs) {
                logger.debug('No mfa type selected');
                return;
            }
            var _inputs = this.inputs,
                TOTP = _inputs.TOTP,
                SMS = _inputs.SMS,
                NOMFA = _inputs.NOMFA;

            var mfaMethod = null;
            if (TOTP) {
                mfaMethod = 'TOTP';
            } else if (SMS) {
                mfaMethod = 'SMS';
            } else if (NOMFA) {
                mfaMethod = 'NOMFA';
            }

            var user = this.props.authData;

            _awsAmplify.Auth.setPreferredMFA(user, mfaMethod).then(function (data) {
                logger.debug('set preferred mfa success', data);
                _this2.setState({ selectMessage: 'Successful! Now you have changed to MFA Type: ' + mfaMethod });
            }).catch(function (err) {
                var message = err.message;

                if (message === 'User has not set up software token mfa') {
                    _this2.setState({ TOTPSetup: true });
                    _this2.setState({ selectMessage: 'You need to setup TOTP' });
                } else {
                    logger.debug('set preferred mfa failed', err);
                    _this2.setState({ selectMessage: 'Failed! You cannot select MFA Type for now!' });
                }
            });
        }
    }, {
        key: 'selectView',
        value: function selectView(theme) {
            var MFATypes = this.props.MFATypes;

            if (!MFATypes || Object.keys(MFATypes).length < 2) {
                logger.debug('less than 2 mfa types available');
                return _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'a',
                        null,
                        'less than 2 mfa types available'
                    )
                );
            }
            var SMS = MFATypes.SMS,
                TOTP = MFATypes.TOTP,
                Optional = MFATypes.Optional;

            return _react2.default.createElement(
                _AmplifyUI.FormSection,
                { theme: theme },
                _react2.default.createElement(
                    _AmplifyUI.SectionHeader,
                    { theme: theme },
                    _awsAmplify.I18n.get('Select MFA Type')
                ),
                _react2.default.createElement(
                    _AmplifyUI.SectionBody,
                    { theme: theme },
                    _react2.default.createElement(
                        _AmplifyUI.MessageRow,
                        { theme: theme },
                        _awsAmplify.I18n.get('Select your preferred MFA Type')
                    ),
                    _react2.default.createElement(
                        'div',
                        null,
                        SMS ? _react2.default.createElement(_AmplifyUI.RadioRow, {
                            placeholder: _awsAmplify.I18n.get('SMS'),
                            theme: theme,
                            key: 'sms',
                            name: 'MFAType',
                            value: 'SMS',
                            onChange: this.handleInputChange
                        }) : null,
                        TOTP ? _react2.default.createElement(_AmplifyUI.RadioRow, {
                            placeholder: _awsAmplify.I18n.get('TOTP'),
                            theme: theme,
                            key: 'totp',
                            name: 'MFAType',
                            value: 'TOTP',
                            onChange: this.handleInputChange
                        }) : null,
                        Optional ? _react2.default.createElement(_AmplifyUI.RadioRow, {
                            placeholder: _awsAmplify.I18n.get('No MFA'),
                            theme: theme,
                            key: 'noMFA',
                            name: 'MFAType',
                            value: 'NOMFA',
                            onChange: this.handleInputChange
                        }) : null,
                        _react2.default.createElement(
                            _AmplifyUI.ButtonRow,
                            { theme: theme, onClick: this.verify },
                            _awsAmplify.I18n.get('Verify')
                        )
                    ),
                    this.state.selectMessage ? _react2.default.createElement(
                        _AmplifyUI.MessageRow,
                        { theme: theme },
                        _awsAmplify.I18n.get(this.state.selectMessage)
                    ) : null
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var theme = this.props.theme ? theme : _AmplifyTheme2.default;
            return _react2.default.createElement(
                'div',
                null,
                this.selectView(theme),
                this.state.TOTPSetup ? _react2.default.createElement(_TOTPSetupComp2.default, this.props) : null
            );
        }
    }]);

    return SelectMFAType;
}(_react.Component);

exports.default = SelectMFAType;