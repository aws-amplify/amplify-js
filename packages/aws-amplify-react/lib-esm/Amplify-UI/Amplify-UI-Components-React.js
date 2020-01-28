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
import '@aws-amplify/ui/dist/style.css';
import * as AmplifyUI from '@aws-amplify/ui';
import AmplifyTheme from './Amplify-UI-Theme';
export var Container = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.container);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: AmplifyUI.container, style: style }),
			props.children
		)
	);
};
export var FormContainer = function(props) {
	var theme = props.theme || AmplifyTheme;
	return beforeAfter(
		React.createElement(
			'div',
			{ className: AmplifyUI.formContainer, style: theme.formContainer },
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
				{ className: AmplifyUI.formSection, style: style },
				props.children
			)
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
			__assign({}, p, { className: AmplifyUI.sectionHeader, style: style }),
			React.createElement(
				SectionHeaderContent,
				{ theme: theme },
				props.children,
				props.hint &&
					React.createElement(
						'div',
						{ className: AmplifyUI.sectionHeaderHint },
						props.hint
					)
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
			{ className: AmplifyUI.sectionHeaderContent, style: style },
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
			__assign({}, p, { className: AmplifyUI.sectionFooter, style: style }),
			props.children
		)
	);
};
export var SectionFooterPrimaryContent = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.sectionFooterPrimaryContent);
	return beforeAfter(
		React.createElement(
			'span',
			{ className: AmplifyUI.sectionFooterPrimaryContent, style: style },
			props.children
		)
	);
};
export var SectionFooterSecondaryContent = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.sectionFooterSecondaryContent);
	return beforeAfter(
		React.createElement(
			'span',
			{ className: AmplifyUI.sectionFooterSecondaryContent, style: style },
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
			__assign({}, p, { className: AmplifyUI.sectionBody, style: style }),
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
export var Strike = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.strike);
	return beforeAfter(
		React.createElement(
			'div',
			{ className: AmplifyUI.strike, style: style },
			React.createElement(StrikeContent, { theme: theme }, props.children)
		)
	);
};
export var StrikeContent = function(props) {
	var theme = props.theme || AmplifyTheme;
	return beforeAfter(
		React.createElement(
			'span',
			{ className: AmplifyUI.strikeContent, style: theme.strikeContent },
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
			__assign({}, p, { className: AmplifyUI.formRow, style: style }),
			props.children
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
				className: AmplifyUI.radio,
				style: style,
			})
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
				__assign({}, p, { className: AmplifyUI.input, style: style })
			)
		)
	);
};
export var Input = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.input);
	var p = JS.objectLessAttributes(props, 'theme');
	return React.createElement(
		'input',
		__assign({}, p, { className: AmplifyUI.input, style: style })
	);
};
export var SelectInput = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.selectInput);
	return React.createElement(
		'div',
		{ className: AmplifyUI.selectInput, style: style },
		props.children
	);
};
export var FormField = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.formField);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: AmplifyUI.formField, style: style }),
			props.children
		)
	);
};
export var Button = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.button);
	var disabled = props.disabled || false;
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'button',
			__assign({}, p, {
				className: AmplifyUI.button,
				style: style,
				disabled: disabled,
			}),
			props.children
		)
	);
};
export var PhotoPickerButton = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.photoPickerButton);
	var p = JS.objectLessAttributes(props, 'theme');
	return React.createElement(
		'button',
		__assign({}, p, {
			className: [AmplifyUI.photoPickerButton, AmplifyUI.button].join(' '),
			style: style,
		}),
		props.children
	);
};
export var SignInButton = function(props) {
	var theme = props.theme || AmplifyTheme;
	var styles = Object.assign({}, theme.signInButton, theme[props.variant]);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'button',
			__assign({}, p, { className: AmplifyUI.signInButton, style: styles }),
			props.children
		)
	);
};
export var SignInButtonIcon = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.signInButtonIcon);
	var p = JS.objectLessAttributes(props, 'theme');
	return beforeAfter(
		React.createElement(
			'span',
			__assign({}, p, { className: AmplifyUI.signInButtonIcon, style: style }),
			props.children
		)
	);
};
export var SignInButtonContent = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.signInButtonContent);
	return beforeAfter(
		React.createElement(
			'span',
			{ className: AmplifyUI.signInButtonContent, style: style },
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
			__assign({}, p, { className: AmplifyUI.a, style: style }),
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
			__assign({}, p, { className: AmplifyUI.label, style: style }),
			props.children
		)
	);
};
export var Hint = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.hint);
	return beforeAfter(
		React.createElement(
			'div',
			{ className: AmplifyUI.hint, style: style },
			props.children
		)
	);
};
export var InputLabel = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.inputLabel);
	return beforeAfter(
		React.createElement(
			'div',
			{ className: AmplifyUI.inputLabel, style: style },
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
			__assign({}, p, { className: AmplifyUI.navBar, style: style }),
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
			__assign({}, p, { className: AmplifyUI.nav, style: style }),
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
			__assign({}, p, { className: AmplifyUI.navRight, style: style }),
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
			__assign({}, p, { className: AmplifyUI.navItem, style: style }),
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
			__assign({}, p, { className: AmplifyUI.button, style: style }),
			beforeAfter(React.createElement('span', null, props.children))
		)
	);
};
export var Toast = function(props) {
	var onClose = props.onClose;
	var theme = props.theme || AmplifyTheme;
	return React.createElement(
		'div',
		__assign({}, props, {
			theme: theme,
			className: AmplifyUI.toast,
			style: theme.toast,
		}),
		React.createElement('span', null, props.children),
		React.createElement('a', {
			className: AmplifyUI.toastClose,
			onClick: onClose,
		})
	);
};
// @ts-ignore
Toast.defaultProps = {
	onClose: function() {
		return void 0;
	},
};
export var PhotoPlaceholder = function(props) {
	var theme = props.theme || AmplifyTheme;
	var style = propStyle(props, theme.photoPlaceholder);
	return React.createElement(
		'div',
		{ className: AmplifyUI.photoPlaceholder, style: style },
		React.createElement(
			'div',
			{ className: AmplifyUI.photoPlaceholderIcon },
			React.createElement(
				'svg',
				{
					xmlns: 'http://www.w3.org/2000/svg',
					width: '64',
					height: '64',
					viewBox: '0 0 24 24',
				},
				React.createElement('circle', { cx: '12', cy: '12', r: '3.2' }),
				React.createElement('path', {
					d:
						'M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z',
				}),
				React.createElement('path', { d: 'M0 0h24v24H0z', fill: 'none' })
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
//# sourceMappingURL=Amplify-UI-Components-React.js.map
