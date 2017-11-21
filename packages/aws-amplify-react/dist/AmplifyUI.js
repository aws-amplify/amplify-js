'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.white1X1 = exports.transparent1X1 = exports.Link = exports.ButtonRow = exports.MessageRow = exports.CheckboxRow = exports.RadioRow = exports.InputRow = exports.Footer = exports.Header = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /*
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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _awsAmplify = require('aws-amplify');

var _AmplifyTheme = require('./AmplifyTheme');

var _AmplifyTheme2 = _interopRequireDefault(_AmplifyTheme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var Header = exports.Header = function Header(props) {
    var theme = props.theme || _AmplifyTheme2['default'];
    return _react2['default'].createElement(
        'div',
        { className: 'amplify-section-header', style: theme.sectionHeader },
        props.children
    );
};

var Footer = exports.Footer = function Footer(props) {
    var theme = props.theme || _AmplifyTheme2['default'];
    return _react2['default'].createElement(
        'div',
        { className: 'amplify-section-footer', style: theme.sectionFooter },
        props.children
    );
};

var InputRow = exports.InputRow = function InputRow(props) {
    var theme = props.theme || _AmplifyTheme2['default'];
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return _react2['default'].createElement(
        'div',
        { className: 'amplify-form-row', style: theme.formRow },
        _react2['default'].createElement('input', _extends({}, p, {
            className: 'amplify-input',
            style: theme.input,
            onChange: props.onChange
        }))
    );
};

var RadioRow = exports.RadioRow = function RadioRow(props) {
    var id = props.id || '_' + props.name;
    var theme = props.theme || _AmplifyTheme2['default'];
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return _react2['default'].createElement(
        'div',
        { className: 'amplify-form-row', style: theme.formRow },
        _react2['default'].createElement('input', _extends({}, p, {
            id: id,
            type: 'radio',
            className: 'amplify-radio',
            style: theme.radio,
            onChange: props.onChange
        })),
        _react2['default'].createElement(
            'label',
            {
                htmlFor: id,
                className: 'amplify-label',
                style: theme.label
            },
            props.placeholder
        )
    );
};

var CheckboxRow = exports.CheckboxRow = function CheckboxRow(props) {
    var id = props.id || '_' + props.name;
    var theme = props.theme || _AmplifyTheme2['default'];
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return _react2['default'].createElement(
        'div',
        { className: 'amplify-form-row', style: theme.formRow },
        _react2['default'].createElement('input', _extends({}, p, {
            id: id,
            type: 'checkbox',
            className: 'amplify-checkbox',
            style: theme.checkbox,
            onChange: props.onChange
        })),
        _react2['default'].createElement(
            'label',
            {
                htmlFor: id,
                className: 'amplify-label',
                style: theme.label
            },
            props.placeholder
        )
    );
};

var MessageRow = exports.MessageRow = function MessageRow(props) {
    var theme = props.theme || _AmplifyTheme2['default'];
    return _react2['default'].createElement(
        'div',
        { className: 'amplify-form-row', style: theme.formRow },
        props.children
    );
};

var ButtonRow = exports.ButtonRow = function ButtonRow(props) {
    var theme = props.theme || _AmplifyTheme2['default'];
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return _react2['default'].createElement(
        'div',
        { className: 'amplify-action-row', style: theme.actionRow },
        _react2['default'].createElement(
            'button',
            _extends({}, p, { style: theme.button }),
            props.children
        )
    );
};

var Link = exports.Link = function Link(props) {
    var theme = props.theme || _AmplifyTheme2['default'];
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return _react2['default'].createElement(
        'a',
        _extends({}, p, { style: theme.a }),
        props.children
    );
};

var transparent1X1 = exports.transparent1X1 = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

var white1X1 = exports.white1X1 = 'data:image/gif;base64,R0lGODlhAQABAIAAAP7//wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';