'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.white1X1 = exports.transparent1X1 = exports.propStyle = exports.beforeAfter = exports.NavButton = exports.NavItem = exports.NavRight = exports.Nav = exports.NavBar = exports.Space = exports.Label = exports.Link = exports.SignInButton = exports.ButtonContent = exports.Button = exports.ButtonRow = exports.MessageContent = exports.MessageRow = exports.Checkbox = exports.CheckboxRow = exports.Radio = exports.RadioRow = exports.InputRow = exports.FormRow = exports.ActionRow = exports.SectionBody = exports.SectionFooterContent = exports.SectionFooter = exports.SectionHeaderContent = exports.SectionHeader = exports.ErrorSectionContent = exports.ErrorSection = exports.FormSection = exports.FormContainer = exports.Container = undefined;

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Container = exports.Container = function Container(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.container);
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return beforeAfter(_react2.default.createElement(
        'div',
        _extends({}, p, { className: 'amplify-container', style: style }),
        props.children
    ));
};

var FormContainer = exports.FormContainer = function FormContainer(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.formContainer);
    return beforeAfter(_react2.default.createElement(
        'div',
        { className: 'amplify-form-container', style: style },
        props.children
    ));
};

var FormSection = exports.FormSection = function FormSection(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.formSection);
    return _react2.default.createElement(
        FormContainer,
        { theme: theme },
        beforeAfter(_react2.default.createElement(
            'div',
            { className: 'amplify-form-section', style: style },
            props.children
        ))
    );
};

var ErrorSection = exports.ErrorSection = function ErrorSection(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.errorSection);
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return beforeAfter(_react2.default.createElement(
        'div',
        _extends({}, p, { className: 'amplify-error-section', style: style }),
        _react2.default.createElement(
            ErrorSectionContent,
            null,
            props.children
        )
    ));
};

var ErrorSectionContent = exports.ErrorSectionContent = function ErrorSectionContent(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.errorSectionContent);
    return beforeAfter(_react2.default.createElement(
        'span',
        { className: 'amplify-error-section-content', style: style },
        props.children
    ));
};

var SectionHeader = exports.SectionHeader = function SectionHeader(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.sectionHeader);
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return beforeAfter(_react2.default.createElement(
        'div',
        _extends({}, p, { className: 'amplify-section-header', style: style }),
        _react2.default.createElement(
            SectionHeaderContent,
            { theme: theme },
            props.children
        )
    ));
};

var SectionHeaderContent = exports.SectionHeaderContent = function SectionHeaderContent(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.sectionHeaderContent);
    return beforeAfter(_react2.default.createElement(
        'span',
        { className: 'amplify-section-header-content', style: style },
        props.children
    ));
};

var SectionFooter = exports.SectionFooter = function SectionFooter(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.sectionFooter);
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return beforeAfter(_react2.default.createElement(
        'div',
        _extends({}, p, { className: 'amplify-section-footer', style: style }),
        _react2.default.createElement(
            SectionFooterContent,
            null,
            props.children
        )
    ));
};

var SectionFooterContent = exports.SectionFooterContent = function SectionFooterContent(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.sectionFooterContent);
    return beforeAfter(_react2.default.createElement(
        'span',
        { className: 'amplify-section-footer-content', style: style },
        props.children
    ));
};

var SectionBody = exports.SectionBody = function SectionBody(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.sectionBody);
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return beforeAfter(_react2.default.createElement(
        'div',
        _extends({}, p, { className: 'amplify-section-body', style: style }),
        props.children
    ));
};

var ActionRow = exports.ActionRow = function ActionRow(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.actionRow);
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return beforeAfter(_react2.default.createElement(
        'div',
        _extends({}, p, { className: 'amplify-action-row', style: style }),
        props.children
    ));
};

var FormRow = exports.FormRow = function FormRow(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.formRow);
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return beforeAfter(_react2.default.createElement(
        'div',
        _extends({}, p, { className: 'amplify-form-row', style: style }),
        props.children
    ));
};

var InputRow = exports.InputRow = function InputRow(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.input);
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return _react2.default.createElement(
        FormRow,
        { theme: theme },
        beforeAfter(_react2.default.createElement('input', _extends({}, p, {
            className: 'amplify-input',
            style: style
        })))
    );
};

var RadioRow = exports.RadioRow = function RadioRow(props) {
    var id = props.id || '_' + props.value;
    var theme = props.theme || _AmplifyTheme2.default;
    return _react2.default.createElement(
        FormRow,
        { theme: theme },
        _react2.default.createElement(Radio, _extends({}, props, {
            id: id
        })),
        _react2.default.createElement(
            Label,
            {
                htmlFor: id,
                theme: theme
            },
            props.placeholder
        )
    );
};

var Radio = exports.Radio = function Radio(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.radio);
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return beforeAfter(_react2.default.createElement('input', _extends({}, p, {
        type: 'radio',
        className: 'amplify-radio',
        style: style
    })));
};

var CheckboxRow = exports.CheckboxRow = function CheckboxRow(props) {
    var id = props.id || '_' + props.name;
    var theme = props.theme || _AmplifyTheme2.default;
    return _react2.default.createElement(
        FormRow,
        { theme: theme },
        _react2.default.createElement(Checkbox, _extends({}, props, {
            id: id
        })),
        _react2.default.createElement(
            Label,
            {
                htmlFor: id,
                theme: theme
            },
            props.placeholder
        )
    );
};

var Checkbox = exports.Checkbox = function Checkbox(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.checkbox);
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return beforeAfter(_react2.default.createElement('input', _extends({}, p, {
        type: 'checkbox',
        className: 'amplify-checkbox',
        style: style
    })));
};

var MessageRow = exports.MessageRow = function MessageRow(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    return _react2.default.createElement(
        FormRow,
        { theme: theme },
        _react2.default.createElement(
            MessageContent,
            { theme: theme },
            props.children
        )
    );
};

var MessageContent = exports.MessageContent = function MessageContent(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    return beforeAfter(_react2.default.createElement(
        'span',
        { className: 'amplify-message-content', style: theme.messageContent },
        props.children
    ));
};

var ButtonRow = exports.ButtonRow = function ButtonRow(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    return beforeAfter(_react2.default.createElement(
        'div',
        { className: 'amplify-action-row', style: theme.actionRow },
        _react2.default.createElement(Button, props)
    ));
};

var Button = exports.Button = function Button(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.button);
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return beforeAfter(_react2.default.createElement(
        'button',
        _extends({}, p, { className: 'amplify-button', style: style }),
        _react2.default.createElement(
            ButtonContent,
            { theme: theme },
            props.children
        )
    ));
};

var ButtonContent = exports.ButtonContent = function ButtonContent(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    return beforeAfter(_react2.default.createElement(
        'span',
        { className: 'amplify-button-content', style: theme.buttonContent },
        props.children
    ));
};

var SignInButton = exports.SignInButton = function SignInButton(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.signInButton);
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');

    return beforeAfter(_react2.default.createElement(
        'button',
        _extends({}, p, { className: 'amplify-signin-button', style: style }),
        props.children
    ));
};

var Link = exports.Link = function Link(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.a);
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return beforeAfter(_react2.default.createElement(
        'a',
        _extends({}, p, { className: 'amplify-a', style: style }),
        props.children
    ));
};

var Label = exports.Label = function Label(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.label);
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return beforeAfter(_react2.default.createElement(
        'label',
        _extends({}, p, { className: 'amplify-label', style: style }),
        props.children
    ));
};

var Space = exports.Space = function Space(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.space);
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return beforeAfter(_react2.default.createElement(
        'span',
        _extends({}, p, { className: 'amplify-space', style: style }),
        props.children
    ));
};

var NavBar = exports.NavBar = function NavBar(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.navBar);
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return beforeAfter(_react2.default.createElement(
        'div',
        _extends({}, p, { className: 'amplify-nav-bar', style: style }),
        props.children
    ));
};

var Nav = exports.Nav = function Nav(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.nav);
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return beforeAfter(_react2.default.createElement(
        'div',
        _extends({}, p, { className: 'amplify-nav', style: style }),
        props.children
    ));
};

var NavRight = exports.NavRight = function NavRight(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.navRight);
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return beforeAfter(_react2.default.createElement(
        'div',
        _extends({}, p, { className: 'amplify-nav-right', style: style }),
        props.children
    ));
};

var NavItem = exports.NavItem = function NavItem(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.navItem);
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return beforeAfter(_react2.default.createElement(
        'div',
        _extends({}, p, { className: 'amplify-nav-item', style: style }),
        props.children
    ));
};

var NavButton = exports.NavButton = function NavButton(props) {
    var theme = props.theme || _AmplifyTheme2.default;
    var style = propStyle(props, theme.navButton);
    var p = _awsAmplify.JS.objectLessAttributes(props, 'theme');
    return beforeAfter(_react2.default.createElement(
        'button',
        _extends({}, p, { className: 'amplify-nav-button', style: style }),
        beforeAfter(_react2.default.createElement(
            'span',
            { style: theme.navButtonContent },
            props.children
        ))
    ));
};

var beforeAfter = exports.beforeAfter = function beforeAfter(el) {
    var style = el.props.style || {};
    var before = style.before,
        after = style.after;

    if (!before && !after) {
        return el;
    }

    return _react2.default.createElement(
        'span',
        { style: { position: 'relative' } },
        before ? _react2.default.createElement(
            'span',
            { style: before },
            before.content
        ) : null,
        el,
        after ? _react2.default.createElement(
            'span',
            { style: after },
            after.content
        ) : null
    );
};

var propStyle = exports.propStyle = function propStyle(props, themeStyle) {
    var id = props.id,
        style = props.style;

    var styl = Object.assign({}, style, themeStyle);
    if (!id) {
        return styl;
    }

    var selector = '#' + id;
    Object.assign(styl, styl[selector]);
    return styl;
};

var transparent1X1 = exports.transparent1X1 = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

var white1X1 = exports.white1X1 = 'data:image/gif;base64,R0lGODlhAQABAIAAAP7//wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';