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

import * as React from 'react';

import { objectLessAttributes } from '@aws-amplify/core';

import AmplifyTheme from './AmplifyTheme';

export const Container = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.container);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<div {...p} className="amplify-container" style={style}>
			{props.children}
		</div>
	);
};

export const FormContainer = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.formContainer);
	return beforeAfter(
		<div className="amplify-form-container" style={style}>
			{props.children}
		</div>
	);
};

export const FormSection = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.formSection);
	return (
		<FormContainer theme={theme}>
			{beforeAfter(
				<div className="amplify-form-section" style={style}>
					{props.children}
				</div>
			)}
		</FormContainer>
	);
};

export const ErrorSection = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.errorSection);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<div {...p} className="amplify-error-section" style={style}>
			<ErrorSectionContent>{props.children}</ErrorSectionContent>
		</div>
	);
};

export const ErrorSectionContent = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.errorSectionContent);
	return beforeAfter(
		<span className="amplify-error-section-content" style={style}>
			{props.children}
		</span>
	);
};

export const SectionHeader = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.sectionHeader);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<div {...p} className="amplify-section-header" style={style}>
			<SectionHeaderContent theme={theme}>
				{props.children}
			</SectionHeaderContent>
		</div>
	);
};

export const SectionHeaderContent = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.sectionHeaderContent);
	return beforeAfter(
		<span className="amplify-section-header-content" style={style}>
			{props.children}
		</span>
	);
};

export const SectionFooter = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.sectionFooter);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<div {...p} className="amplify-section-footer" style={style}>
			<SectionFooterContent theme={theme}>{props.children}</SectionFooterContent>
		</div>
	);
};

export const SectionFooterContent = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.sectionFooterContent);
	return beforeAfter(
		<span className="amplify-section-footer-content" style={style}>
			{props.children}
		</span>
	);
};

export const SectionBody = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.sectionBody);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<div {...p} className="amplify-section-body" style={style}>
			{props.children}
		</div>
	);
};

export const ActionRow = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.actionRow);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<div {...p} className="amplify-action-row" style={style}>
			{props.children}
		</div>
	);
};

export const FormRow = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.formRow);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<div {...p} className="amplify-form-row" style={style}>
			{props.children}
		</div>
	);
};

export const InputRow = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.input);
	const p = objectLessAttributes(props, 'theme');
	return (
		<FormRow theme={theme}>
			{beforeAfter(<input {...p} className="amplify-input" style={style} />)}
		</FormRow>
	);
};

export const RadioRow = props => {
	const id = props.id || '_' + props.value;
	const theme = props.theme || AmplifyTheme;
	return (
		<FormRow theme={theme}>
			<Radio {...props} id={id} />
			<Label htmlFor={id} theme={theme}>
				{props.placeholder}
			</Label>
		</FormRow>
	);
};

export const Radio = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.radio);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<input {...p} type="radio" className="amplify-radio" style={style} />
	);
};

export const CheckboxRow = props => {
	const id = props.id || '_' + props.name;
	const theme = props.theme || AmplifyTheme;
	return (
		<FormRow theme={theme}>
			<Checkbox {...props} id={id} />
			<Label htmlFor={id} theme={theme}>
				{props.placeholder}
			</Label>
		</FormRow>
	);
};

export const Checkbox = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.checkbox);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<input {...p} type="checkbox" className="amplify-checkbox" style={style} />
	);
};

export const MessageRow = props => {
	const theme = props.theme || AmplifyTheme;
	return (
		<FormRow theme={theme}>
			<MessageContent theme={theme}>{props.children}</MessageContent>
		</FormRow>
	);
};

export const MessageContent = props => {
	const theme = props.theme || AmplifyTheme;
	return beforeAfter(
		<span className="amplify-message-content" style={theme.messageContent}>
			{props.children}
		</span>
	);
};

export const ButtonRow = props => {
	const theme = props.theme || AmplifyTheme;
	return beforeAfter(
		<div className="amplify-action-row" style={theme.actionRow}>
			<Button {...props} />
		</div>
	);
};

export const Button = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.button);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<button {...p} className="amplify-button" style={style}>
			<ButtonContent theme={theme}>{props.children}</ButtonContent>
		</button>
	);
};

export const ButtonContent = props => {
	const theme = props.theme || AmplifyTheme;
	return beforeAfter(
		<span className="amplify-button-content" style={theme.buttonContent}>
			{props.children}
		</span>
	);
};

export const SignInButton = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.signInButton);
	const p = objectLessAttributes(props, 'theme');

	return beforeAfter(
		<button {...p} className="amplify-signin-button" style={style}>
			{props.children}
		</button>
	);
};

export const Link = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.a);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<a {...p} className="amplify-a" style={style}>
			{props.children}
		</a>
	);
};

export const Label = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.label);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<label {...p} className="amplify-label" style={style}>
			{props.children}
		</label>
	);
};

export const Space = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.space);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<span {...p} className="amplify-space" style={style}>
			{props.children}
		</span>
	);
};

export const NavBar = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.navBar);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<div {...p} className="amplify-nav-bar" style={style}>
			{props.children}
		</div>
	);
};

export const Nav = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.nav);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<div {...p} className="amplify-nav" style={style}>
			{props.children}
		</div>
	);
};

export const NavRight = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.navRight);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<div {...p} className="amplify-nav-right" style={style}>
			{props.children}
		</div>
	);
};

export const NavItem = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.navItem);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<div {...p} className="amplify-nav-item" style={style}>
			{props.children}
		</div>
	);
};

export const NavButton = props => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.navButton);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<button {...p} className="amplify-nav-button" style={style}>
			{beforeAfter(
				<span style={theme.navButtonContent}>{props.children}</span>
			)}
		</button>
	);
};

export const beforeAfter = el => {
	const style = el.props.style || {};
	const { before, after } = style;
	if (!before && !after) {
		return el;
	}

	return (
		<span style={{ position: 'relative' }}>
			{before ? <span style={before}>{before.content}</span> : null}
			{el}
			{after ? <span style={after}>{after.content}</span> : null}
		</span>
	);
};

export const propStyle = (props, themeStyle) => {
	const { id, style } = props;
	const styl = Object.assign({}, style, themeStyle);
	if (!id) {
		return styl;
	}

	const selector = '#' + id;
	Object.assign(styl, styl[selector]);
	return styl;
};

export const transparent1X1 =
	'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

export const white1X1 =
	'data:image/gif;base64,R0lGODlhAQABAIAAAP7//wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';
