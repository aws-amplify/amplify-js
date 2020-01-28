/*
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
var __assign =
	(this && this.__assign) ||
	function() {
		__assign =
			Object.assign ||
			function(t) {
				for (var s, i = 1, n = arguments.length; i < n; i++) {
					s = arguments[i];
					for (var p in s)
						if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
				}
				return t;
			};
		return __assign.apply(this, arguments);
	};
import * as React from 'react';
import { JS } from '@aws-amplify/core';
import AmplifyTheme from './AmplifyTheme';
export var Container = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.container);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: 'amplify-container', style: style }),
			props.children
		)
	);
};
export var FormContainer = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.formContainer);
	return beforeAfter(
		React.createElement(
			'div',
			{ className: 'amplify-form-container', style: style },
			props.children
		)
	);
};
export var FormSection = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.formSection);
	return React.createElement(
		FormContainer,
		{ theme: theme },
		beforeAfter(
			React.createElement(
				'div',
				{ className: 'amplify-form-section', style: style },
				props.children
			)
		)
	);
};
export var ErrorSection = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.errorSection);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: 'amplify-error-section', style: style }),
			React.createElement(ErrorSectionContent, null, props.children)
		)
	);
};
export var ErrorSectionContent = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.errorSectionContent);
	return beforeAfter(
		React.createElement(
			'span',
			{ className: 'amplify-error-section-content', style: style },
			props.children
		)
	);
};
export var SectionHeader = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.sectionHeader);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: 'amplify-section-header', style: style }),
			React.createElement(
				SectionHeaderContent,
				{ theme: theme },
				props.children
			)
		)
	);
};
export var SectionHeaderContent = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.sectionHeaderContent);
	return beforeAfter(
		React.createElement(
			'span',
			{ className: 'amplify-section-header-content', style: style },
			props.children
		)
	);
};
export var SectionFooter = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.sectionFooter);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: 'amplify-section-footer', style: style }),
			React.createElement(SectionFooterContent, null, props.children)
		)
	);
};
export var SectionFooterContent = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.sectionFooterContent);
	return beforeAfter(
		React.createElement(
			'span',
			{ className: 'amplify-section-footer-content', style: style },
			props.children
		)
	);
};
export var SectionBody = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.sectionBody);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: 'amplify-section-body', style: style }),
			props.children
		)
	);
};
export var ActionRow = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.actionRow);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: 'amplify-action-row', style: style }),
			props.children
		)
	);
};
export var FormRow = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.formRow);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: 'amplify-form-row', style: style }),
			props.children
		)
	);
};
export var InputRow = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.input);
	var p = JS.objectLessAttributes(props, 'theme');
	return React.createElement(
		FormRow,
		{ theme: theme },
		beforeAfter(
			React.createElement(
				'input',
				__assign({}, p, { className: 'amplify-input', style: style })
			)
		)
	);
};
export var RadioRow = function(props) {
	var id = props.id || '_' + props.value;
	var theme = props.theme || AmplifyTheme;
	return React.createElement(
		FormRow,
		{ theme: theme },
		React.createElement(Radio, __assign({}, props, { id: id })),
		React.createElement(Label, { htmlFor: id, theme: theme }, props.placeholder)
	);
};
export var Radio = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.radio);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'input',
			__assign({}, p, {
				type: 'radio',
				className: 'amplify-radio',
				style: style,
			})
		)
	);
};
export var CheckboxRow = function(props) {
	var id = props.id || '_' + props.name;
	var theme = props.theme || AmplifyTheme;
	return React.createElement(
		FormRow,
		{ theme: theme },
		React.createElement(Checkbox, __assign({}, props, { id: id })),
		React.createElement(Label, { htmlFor: id, theme: theme }, props.placeholder)
	);
};
export var Checkbox = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.checkbox);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'input',
			__assign({}, p, {
				type: 'checkbox',
				className: 'amplify-checkbox',
				style: style,
			})
		)
	);
};
export var MessageRow = function(props) {
	var theme = props.theme || AmplifyTheme;
	return React.createElement(
		FormRow,
		{ theme: theme },
		React.createElement(MessageContent, { theme: theme }, props.children)
	);
};
export var MessageContent = function(props) {
	var theme = props.theme || AmplifyTheme;
	return beforeAfter(
		React.createElement(
			'span',
			{ className: 'amplify-message-content', style: theme.messageContent },
			props.children
		)
	);
};
export var ButtonRow = function(props) {
	var theme = props.theme || AmplifyTheme;
	return beforeAfter(
		React.createElement(
			'div',
			{ className: 'amplify-action-row', style: theme.actionRow },
			React.createElement(Button, __assign({}, props))
		)
	);
};
export var Button = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.button);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'button',
			__assign({}, p, { className: 'amplify-button', style: style }),
			React.createElement(ButtonContent, { theme: theme }, props.children)
		)
	);
};
export var ButtonContent = function(props) {
	var theme = props.theme || AmplifyTheme;
	return beforeAfter(
		React.createElement(
			'span',
			{ className: 'amplify-button-content', style: theme.buttonContent },
			props.children
		)
	);
};
export var SignInButton = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.signInButton);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'button',
			__assign({}, p, { className: 'amplify-signin-button', style: style }),
			props.children
		)
	);
};
export var Link = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.a);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'a',
			__assign({}, p, { className: 'amplify-a', style: style }),
			props.children
		)
	);
};
export var Label = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.label);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'label',
			__assign({}, p, { className: 'amplify-label', style: style }),
			props.children
		)
	);
};
export var Space = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.space);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'span',
			__assign({}, p, { className: 'amplify-space', style: style }),
			props.children
		)
	);
};
export var NavBar = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.navBar);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: 'amplify-nav-bar', style: style }),
			props.children
		)
	);
};
export var Nav = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.nav);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: 'amplify-nav', style: style }),
			props.children
		)
	);
};
export var NavRight = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.navRight);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: 'amplify-nav-right', style: style }),
			props.children
		)
	);
};
export var NavItem = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.navItem);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: 'amplify-nav-item', style: style }),
			props.children
		)
	);
};
export var NavButton = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.navButton);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'button',
			__assign({}, p, { className: 'amplify-nav-button', style: style }),
			beforeAfter(
				React.createElement(
					'span',
					{ style: theme.navButtonContent },
					props.children
				)
			)
		)
	);
};
export var beforeAfter = function(el) {
	var style = el.props.style || {};
	var before = style.before,
		after = style.after;
	if (!before && !after) {
		return el;
	}
	return React.createElement(
		'span',
		{ style: { position: 'relative' } },
		before
			? React.createElement('span', { style: before }, before.content)
			: null,
		el,
		after ? React.createElement('span', { style: after }, after.content) : null
	);
};
export var propStyle = function(props, themeStyle) {
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
export var transparent1X1 =
	'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
export var white1X1 =
	'data:image/gif;base64,R0lGODlhAQABAIAAAP7//wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';
//# sourceMappingURL=AmplifyUI.js.map
