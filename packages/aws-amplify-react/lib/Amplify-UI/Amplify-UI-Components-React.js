'use strict';
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
Object.defineProperty(exports, '__esModule', { value: true });
var React = require('react');
var core_1 = require('@aws-amplify/core');
require('@aws-amplify/ui/dist/style.css');
var AmplifyUI = require('@aws-amplify/ui');
var Amplify_UI_Theme_1 = require('./Amplify-UI-Theme');
exports.Container = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.container);
	var p = core_1.JS.objectLessAttributes(props, 'theme');
	return exports.beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: AmplifyUI.container, style: style }),
			props.children
		)
	);
};
exports.FormContainer = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	return exports.beforeAfter(
		React.createElement(
			'div',
			{ className: AmplifyUI.formContainer, style: theme.formContainer },
			props.children
		)
	);
};
exports.FormSection = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.formSection);
	return React.createElement(
		exports.FormContainer,
		{ theme: theme },
		exports.beforeAfter(
			React.createElement(
				'div',
				{ className: AmplifyUI.formSection, style: style },
				props.children
			)
		)
	);
};
exports.SectionHeader = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.sectionHeader);
	var p = core_1.JS.objectLessAttributes(props, 'theme');
	return exports.beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: AmplifyUI.sectionHeader, style: style }),
			React.createElement(
				exports.SectionHeaderContent,
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
exports.SectionHeaderContent = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.sectionHeaderContent);
	return exports.beforeAfter(
		React.createElement(
			'span',
			{ className: AmplifyUI.sectionHeaderContent, style: style },
			props.children
		)
	);
};
exports.SectionFooter = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.sectionFooter);
	var p = core_1.JS.objectLessAttributes(props, 'theme');
	return exports.beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: AmplifyUI.sectionFooter, style: style }),
			props.children
		)
	);
};
exports.SectionFooterPrimaryContent = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.sectionFooterPrimaryContent);
	return exports.beforeAfter(
		React.createElement(
			'span',
			{ className: AmplifyUI.sectionFooterPrimaryContent, style: style },
			props.children
		)
	);
};
exports.SectionFooterSecondaryContent = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.sectionFooterSecondaryContent);
	return exports.beforeAfter(
		React.createElement(
			'span',
			{ className: AmplifyUI.sectionFooterSecondaryContent, style: style },
			props.children
		)
	);
};
exports.SectionBody = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.sectionBody);
	var p = core_1.JS.objectLessAttributes(props, 'theme');
	return exports.beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: AmplifyUI.sectionBody, style: style }),
			props.children
		)
	);
};
exports.ActionRow = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.actionRow);
	var p = core_1.JS.objectLessAttributes(props, 'theme');
	return exports.beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: 'amplify-action-row', style: style }),
			props.children
		)
	);
};
exports.Strike = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.strike);
	return exports.beforeAfter(
		React.createElement(
			'div',
			{ className: AmplifyUI.strike, style: style },
			React.createElement(
				exports.StrikeContent,
				{ theme: theme },
				props.children
			)
		)
	);
};
exports.StrikeContent = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	return exports.beforeAfter(
		React.createElement(
			'span',
			{ className: AmplifyUI.strikeContent, style: theme.strikeContent },
			props.children
		)
	);
};
exports.FormRow = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.formRow);
	var p = core_1.JS.objectLessAttributes(props, 'theme');
	return exports.beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: AmplifyUI.formRow, style: style }),
			props.children
		)
	);
};
exports.RadioRow = function(props) {
	var id = props.id || '_' + props.value;
	var theme = props.theme || Amplify_UI_Theme_1.default;
	return React.createElement(
		exports.FormRow,
		{ theme: theme },
		React.createElement(exports.Radio, __assign({}, props, { id: id })),
		React.createElement(
			exports.Label,
			{ htmlFor: id, theme: theme },
			props.placeholder
		)
	);
};
exports.Radio = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.radio);
	var p = core_1.JS.objectLessAttributes(props, 'theme');
	return exports.beforeAfter(
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
exports.InputRow = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.input);
	var p = core_1.JS.objectLessAttributes(props, 'theme');
	return React.createElement(
		exports.FormRow,
		{ theme: theme },
		exports.beforeAfter(
			React.createElement(
				'input',
				__assign({}, p, { className: AmplifyUI.input, style: style })
			)
		)
	);
};
exports.Input = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.input);
	var p = core_1.JS.objectLessAttributes(props, 'theme');
	return React.createElement(
		'input',
		__assign({}, p, { className: AmplifyUI.input, style: style })
	);
};
exports.SelectInput = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.selectInput);
	return React.createElement(
		'div',
		{ className: AmplifyUI.selectInput, style: style },
		props.children
	);
};
exports.FormField = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.formField);
	var p = core_1.JS.objectLessAttributes(props, 'theme');
	return exports.beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: AmplifyUI.formField, style: style }),
			props.children
		)
	);
};
exports.Button = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.button);
	var disabled = props.disabled || false;
	var p = core_1.JS.objectLessAttributes(props, 'theme');
	return exports.beforeAfter(
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
exports.PhotoPickerButton = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.photoPickerButton);
	var p = core_1.JS.objectLessAttributes(props, 'theme');
	return React.createElement(
		'button',
		__assign({}, p, {
			className: [AmplifyUI.photoPickerButton, AmplifyUI.button].join(' '),
			style: style,
		}),
		props.children
	);
};
exports.SignInButton = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var styles = Object.assign({}, theme.signInButton, theme[props.variant]);
	var p = core_1.JS.objectLessAttributes(props, 'theme');
	return exports.beforeAfter(
		React.createElement(
			'button',
			__assign({}, p, { className: AmplifyUI.signInButton, style: styles }),
			props.children
		)
	);
};
exports.SignInButtonIcon = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.signInButtonIcon);
	var p = core_1.JS.objectLessAttributes(props, 'theme');
	return exports.beforeAfter(
		React.createElement(
			'span',
			__assign({}, p, { className: AmplifyUI.signInButtonIcon, style: style }),
			props.children
		)
	);
};
exports.SignInButtonContent = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.signInButtonContent);
	return exports.beforeAfter(
		React.createElement(
			'span',
			{ className: AmplifyUI.signInButtonContent, style: style },
			props.children
		)
	);
};
exports.Link = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.a);
	var p = core_1.JS.objectLessAttributes(props, 'theme');
	return exports.beforeAfter(
		React.createElement(
			'a',
			__assign({}, p, { className: AmplifyUI.a, style: style }),
			props.children
		)
	);
};
exports.Label = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.label);
	var p = core_1.JS.objectLessAttributes(props, 'theme');
	return exports.beforeAfter(
		React.createElement(
			'label',
			__assign({}, p, { className: AmplifyUI.label, style: style }),
			props.children
		)
	);
};
exports.Hint = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.hint);
	return exports.beforeAfter(
		React.createElement(
			'div',
			{ className: AmplifyUI.hint, style: style },
			props.children
		)
	);
};
exports.InputLabel = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.inputLabel);
	return exports.beforeAfter(
		React.createElement(
			'div',
			{ className: AmplifyUI.inputLabel, style: style },
			props.children
		)
	);
};
exports.NavBar = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.navBar);
	var p = core_1.JS.objectLessAttributes(props, 'theme');
	return exports.beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: AmplifyUI.navBar, style: style }),
			props.children
		)
	);
};
exports.Nav = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.nav);
	var p = core_1.JS.objectLessAttributes(props, 'theme');
	return exports.beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: AmplifyUI.nav, style: style }),
			props.children
		)
	);
};
exports.NavRight = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.navRight);
	var p = core_1.JS.objectLessAttributes(props, 'theme');
	return exports.beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: AmplifyUI.navRight, style: style }),
			props.children
		)
	);
};
exports.NavItem = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.navItem);
	var p = core_1.JS.objectLessAttributes(props, 'theme');
	return exports.beforeAfter(
		React.createElement(
			'div',
			__assign({}, p, { className: AmplifyUI.navItem, style: style }),
			props.children
		)
	);
};
exports.NavButton = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.navButton);
	var p = core_1.JS.objectLessAttributes(props, 'theme');
	return exports.beforeAfter(
		React.createElement(
			'button',
			__assign({}, p, { className: AmplifyUI.button, style: style }),
			exports.beforeAfter(React.createElement('span', null, props.children))
		)
	);
};
exports.Toast = function(props) {
	var onClose = props.onClose;
	var theme = props.theme || Amplify_UI_Theme_1.default;
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
exports.Toast.defaultProps = {
	onClose: function() {
		return void 0;
	},
};
exports.PhotoPlaceholder = function(props) {
	var theme = props.theme || Amplify_UI_Theme_1.default;
	var style = exports.propStyle(props, theme.photoPlaceholder);
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
exports.beforeAfter = function(el) {
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
exports.propStyle = function(props, themeStyle) {
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
