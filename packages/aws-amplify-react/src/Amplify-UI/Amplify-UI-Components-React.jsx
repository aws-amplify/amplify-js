import React from 'react';

import { JS } from '@aws-amplify/core';

// import './amplify-ui.css';
// import AmplifyUI from './Amplify-UI.css';
import AmplifyUI from '@aws-amplify/ui';

import AmplifyTheme from './Amplify-UI-Theme';


export const FormContainer = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.formContainer);
    return beforeAfter(
        <div className="amplify-form-container" style={style}>
            {props.children}
        </div>
    )
}

export const FormSection = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.formSection);
    return (
        <FormContainer theme={theme}>
            {beforeAfter(
                <div className={AmplifyUI.formSection}>
                    {props.children}
                </div>
            )}
        </FormContainer>
    )
}

export const SectionHeader = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.sectionHeader);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <div {...p} className="amplify-section-header" style={style}>
            <SectionHeaderContent theme={theme}>
                {props.children}
            </SectionHeaderContent>
        </div>
    )
}

export const SectionHeaderContent = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.sectionHeaderContent);
    return beforeAfter(
        <span className="amplify-section-header-content" style={style}>
            {props.children}
        </span>
    )
}

export const SectionFooter = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.sectionFooter);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <div {...p} className="amplify-section-footer" style={style}>
            {props.children}
        </div>
    )
}

export const SectionFooterPrimaryContent = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.sectionFooterPrimaryContent);
    return beforeAfter(
        <span className="amplify-section-footer-primary-content" style={style}>
            {props.children}
        </span>
    )
}

export const SectionFooterSecondaryContent = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.sectionFooterSecondaryContent);
    return beforeAfter(
        <span className="amplify-section-footer-secondary-content" style={style}>
            {props.children}
        </span>
    )
}

export const SectionBody = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.sectionBody);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <div {...p} className="amplify-section-body" style={style}>
            {props.children}
        </div>
    )
}

export const ActionRow = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.actionRow);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <div {...p} className="amplify-action-row" style={style}>
            {props.children}
        </div>
    )
}

export const Strike = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.strike);
    return beforeAfter(
        <div className="amplify-strike" style={style}>
            <StrikeContent theme={theme}>{props.children}</StrikeContent>
        </div>
    )
}

export const StrikeContent = (props) => {
    const theme = props.theme || AmplifyTheme;
    return beforeAfter(
        <span className="amplify-strike-content" style={theme.strikeContent}>
            {props.children}
        </span>
    )
}

export const FormRow = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.formRow);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <div {...p} className="amplify-form-row" style={style}>
            {props.children}
        </div>
    )
}

export const RadioRow = (props) => {
    const id = props.id || '_' + props.value;
    const theme = props.theme || AmplifyTheme;
    return (
        <FormRow theme={theme}>
            <Radio
                {...props}
                id={id}
            />
            <Label
                htmlFor={id}
                theme={theme}
            >{props.placeholder}</Label>
        </FormRow>
    )
}

export const Radio = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.radio);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
            <input
                {...p}
                type="radio"
                className="amplify-radio"
                style={style}
            />
    )
}

export const InputRow = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.input);
    const p = JS.objectLessAttributes(props, 'theme');
    return (
        <FormRow theme={theme}>
            {beforeAfter(
                <input
                    {...p}
                    className="amplify-input"
                    style={style}
                />
            )}
        </FormRow>
    )
}

export const Input = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.input);
    const p = JS.objectLessAttributes(props, 'theme');
    return (
        <input
            {...p}
            className="amplify-input"
            style={style}
        />
    )
}

export const SelectInput = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.selectInput);
    return (
        <div className="amplify-select-input" style={style}>
            {props.children}
        </div>
    )
}

export const FormField = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.formField);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <div {...p} className="amplify-form-field" style={style}>
            {props.children}
        </div>
    )
}

export const ButtonRow = (props) => {
    const theme = props.theme || AmplifyTheme;
    return beforeAfter(
        <div className="amplify-action-row" style={theme.actionRow}>
            <Button {...props} />
        </div>
    )
}

export const Button = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.button);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <button {...p} className="amplify-button" style={style}>
            <ButtonContent theme={theme}>{props.children}</ButtonContent>
        </button>
    )
}

export const ButtonContent = (props) => {
    const theme = props.theme || AmplifyTheme;
    return beforeAfter(
        <span className="amplify-button-content" style={theme.buttonContent}>
            {props.children}
        </span>
    )
}

export const SignInButton = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.signInButton);
    const p = JS.objectLessAttributes(props, 'theme');

    return beforeAfter(
        <button {...p} className="amplify-signin-button" style={style}>
            {props.children}
        </button>
    )
}

export const SignInButtonIcon = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.signInButtonIcon);
    return beforeAfter(
        <span className="amplify-signin-button-icon" style={style}>
            {props.children}
        </span>
    )
}

export const SignInButtonContent = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.signInButtonContent);
    return beforeAfter(
        <span className="amplify-signin-button-content" style={style}>
            {props.children}
        </span>
    )
}

export const Link = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.a);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <a {...p} className="amplify-a" style={style}>{props.children}</a>
    )
}

export const Label = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.label);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <label {...p} className="amplify-label" style={style}>{props.children}</label>
    )
}

export const Hint = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.hint);
    return beforeAfter(
        <div className="amplify-hint" style={style}>
            {props.children}
        </div>
    )
}

export const InputLabel = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.inputLabel);
    return beforeAfter(
        <div className="amplify-input-label" style={style}>
            {props.children}
        </div>
    )
}

export class Toast extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            isActive: true
        }
    }

    render() {
        const theme = this.props.theme || AmplifyTheme;
        const style = propStyle(this.props, theme.toast);

        return this.state.isActive ? (
            <div theme={theme} className="amplify-toast" style={style}>
                {this.props.children}
                <a className="amplify-toast-close" onClick={() => this.setState({isActive: false})} style={{float: 'right', cursor: 'pointer'}}/>
            </div>
        ) : null
    }
}

export const beforeAfter = (el) => {
    const style = el.props.style || {};
    const { before, after } = style;
    if (!before && !after) { return el; }

    return (
        <span style={{ position: 'relative' }}>
            {before ? <span style={before}>{before.content}</span> : null}
            {el}
            {after ? <span style={after}>{after.content}</span> : null}
        </span>
    )
}

export const propStyle = (props, themeStyle) => {
    const { id, style } = props;
    const styl = Object.assign({}, style, themeStyle);
    if (!id) { return styl; }

    const selector = '#' + id;
    Object.assign(styl, styl[selector]);
    return styl;
}