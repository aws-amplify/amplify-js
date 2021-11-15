import * as React from 'react';

import { objectLessAttributes } from '@aws-amplify/core';

import * as AmplifyUI from '@aws-amplify/ui';

import AmplifyTheme from './Amplify-UI-Theme';

export const Container = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.container);
	const p = objectLessAttributes(props, 'theme');

	return beforeAfter(
		<div {...p} className={AmplifyUI.container} style={style}>
			{props.children}
		</div>
	);
};

export const FormContainer = (props) => {
	const theme = props.theme || AmplifyTheme;
	return beforeAfter(
		<div className={AmplifyUI.formContainer} style={theme.formContainer}>
			{props.children}
		</div>
	);
};

export const FormSection = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.formSection);
	return (
		<FormContainer theme={theme}>
			{beforeAfter(
				<div className={AmplifyUI.formSection} style={style}>
					{props.children}
				</div>
			)}
		</FormContainer>
	);
};

export const SectionHeader = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.sectionHeader);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<div {...p} className={AmplifyUI.sectionHeader} style={style}>
			<SectionHeaderContent theme={theme}>
				{props.children}
				{props.hint && (
					<div className={AmplifyUI.sectionHeaderHint}>{props.hint}</div>
				)}
			</SectionHeaderContent>
		</div>
	);
};

export const SectionHeaderContent = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.sectionHeaderContent);
	return beforeAfter(
		<span className={AmplifyUI.sectionHeaderContent} style={style}>
			{props.children}
		</span>
	);
};

export const SectionFooter = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.sectionFooter);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<div {...p} className={AmplifyUI.sectionFooter} style={style}>
			{props.children}
		</div>
	);
};

export const SectionFooterPrimaryContent = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.sectionFooterPrimaryContent);
	return beforeAfter(
		<span className={AmplifyUI.sectionFooterPrimaryContent} style={style}>
			{props.children}
		</span>
	);
};

export const SectionFooterSecondaryContent = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.sectionFooterSecondaryContent);
	return beforeAfter(
		<span className={AmplifyUI.sectionFooterSecondaryContent} style={style}>
			{props.children}
		</span>
	);
};

export const SectionBody = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.sectionBody);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<div {...p} className={AmplifyUI.sectionBody} style={style}>
			{props.children}
		</div>
	);
};

export const ActionRow = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.actionRow);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<div {...p} className="amplify-action-row" style={style}>
			{props.children}
		</div>
	);
};

export const Strike = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.strike);
	return beforeAfter(
		<div className={AmplifyUI.strike} style={style}>
			<StrikeContent theme={theme}>{props.children}</StrikeContent>
		</div>
	);
};

export const StrikeContent = (props) => {
	const theme = props.theme || AmplifyTheme;
	return beforeAfter(
		<span className={AmplifyUI.strikeContent} style={theme.strikeContent}>
			{props.children}
		</span>
	);
};

export const FormRow = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.formRow);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<div {...p} className={AmplifyUI.formRow} style={style}>
			{props.children}
		</div>
	);
};

export const RadioRow = (props) => {
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

export const Radio = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.radio);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<input {...p} type="radio" className={AmplifyUI.radio} style={style} />
	);
};

export const InputRow = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.input);
	const p = objectLessAttributes(props, 'theme');
	return (
		<FormRow theme={theme}>
			{beforeAfter(<input {...p} className={AmplifyUI.input} style={style} />)}
		</FormRow>
	);
};

export const Input = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.input);
	const p = objectLessAttributes(props, 'theme');
	return <input {...p} className={AmplifyUI.input} style={style} />;
};

export const SelectInput = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.selectInput);
	return (
		<div className={AmplifyUI.selectInput} style={style}>
			{props.children}
		</div>
	);
};

export const FormField = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.formField);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<div {...p} className={AmplifyUI.formField} style={style}>
			{props.children}
		</div>
	);
};

export const Button = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.button);
	const disabled = props.disabled || false;
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<button
			{...p}
			className={AmplifyUI.button}
			style={style}
			disabled={disabled}
		>
			{props.children}
		</button>
	);
};

export const PhotoPickerButton = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.photoPickerButton);
	const p = objectLessAttributes(props, 'theme');
	return (
		<button
			{...p}
			className={[AmplifyUI.photoPickerButton, AmplifyUI.button].join(' ')}
			style={style}
		>
			{props.children}
		</button>
	);
};

export const SignInButton = (props) => {
	const theme = props.theme || AmplifyTheme;
	const styles = Object.assign({}, theme.signInButton, theme[props.variant]);
	const p = objectLessAttributes(props, 'theme');

	return beforeAfter(
		<button {...p} className={AmplifyUI.signInButton} style={styles}>
			{props.children}
		</button>
	);
};

export const SignInButtonIcon = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.signInButtonIcon);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<span {...p} className={AmplifyUI.signInButtonIcon} style={style}>
			{props.children}
		</span>
	);
};

export const SignInButtonContent = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.signInButtonContent);
	return beforeAfter(
		<span className={AmplifyUI.signInButtonContent} style={style}>
			{props.children}
		</span>
	);
};

export const Link = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.a);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<a {...p} className={AmplifyUI.a} style={style}>
			{props.children}
		</a>
	);
};

export const Label = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.label);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<label {...p} className={AmplifyUI.label} style={style}>
			{props.children}
		</label>
	);
};

export const Hint = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.hint);
	return beforeAfter(
		<div className={AmplifyUI.hint} style={style}>
			{props.children}
		</div>
	);
};

export const InputLabel = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.inputLabel);
	return beforeAfter(
		<div className={AmplifyUI.inputLabel} style={style}>
			{props.children}
		</div>
	);
};

export const NavBar = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.navBar);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<div {...p} className={AmplifyUI.navBar} style={style}>
			{props.children}
		</div>
	);
};

export const Nav = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.nav);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<div {...p} className={AmplifyUI.nav} style={style}>
			{props.children}
		</div>
	);
};

export const NavRight = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.navRight);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<div {...p} className={AmplifyUI.navRight} style={style}>
			{props.children}
		</div>
	);
};

export const NavItem = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.navItem);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<div {...p} className={AmplifyUI.navItem} style={style}>
			{props.children}
		</div>
	);
};

export const NavButton = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.navButton);
	const p = objectLessAttributes(props, 'theme');
	return beforeAfter(
		<button {...p} className={AmplifyUI.button} style={style}>
			{beforeAfter(<span>{props.children}</span>)}
		</button>
	);
};

export const Toast = (props) => {
	const { onClose } = props;
	const theme = props.theme || AmplifyTheme;

	return (
		<div
			{...props}
			theme={theme}
			className={AmplifyUI.toast}
			style={theme.toast}
		>
			<span>{props.children}</span>
			<a className={AmplifyUI.toastClose} onClick={onClose} />
		</div>
	);
};

// @ts-ignore
Toast.defaultProps = {
	onClose: () => void 0,
};

export const PhotoPlaceholder = (props) => {
	const theme = props.theme || AmplifyTheme;
	const style = propStyle(props, theme.photoPlaceholder);
	return (
		<div className={AmplifyUI.photoPlaceholder} style={style}>
			<div className={AmplifyUI.photoPlaceholderIcon}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="64"
					height="64"
					viewBox="0 0 24 24"
				>
					<circle cx="12" cy="12" r="3.2" />
					<path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
					<path d="M0 0h24v24H0z" fill="none" />
				</svg>
			</div>
		</div>
	);
};

export const beforeAfter = (el) => {
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
