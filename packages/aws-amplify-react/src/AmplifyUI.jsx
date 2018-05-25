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

import React from 'react';

import { JS } from 'aws-amplify';

import AmplifyTheme from './AmplifyTheme';

export const Container = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.container);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <div {...p} className={themedClassName("amplify-container", theme.container)} style={style}>
            {props.children}
        </div>
    )
}

export const FormContainer = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.formContainer);
    return beforeAfter(
        <div className={themedClassName("amplify-form-container", theme.formContainer)} style={style}>
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
                <div className={themedClassName("amplify-form-section", theme.formSection)} style={style}>
                    {props.children}
                </div>
            )}
        </FormContainer>
    )
}

export const ErrorSection = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.errorSection);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <div {...p} className={themedClassName("amplify-error-section", theme.errorSection)} style={style}>
            <ErrorSectionContent>
                {props.children}
            </ErrorSectionContent>
        </div>
    )
}

export const ErrorSectionContent = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.errorSectionContent);
    return beforeAfter(
        <span className={themedClassName("amplify-error-section-content", theme.errorSectionContent)} style={style}>
            {props.children}
        </span>
    )
}

export const SectionHeader = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.sectionHeader);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <div {...p} className={themedClassName("amplify-section-header", theme.sectionHeader)} style={style}>
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
        <span className={themedClassName("amplify-section-header-content", theme.sectionHeaderContent)} style={style}>
            {props.children}
        </span>
    )
}

export const SectionFooter = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.sectionFooter);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <div {...p} className={themedClassName("amplify-section-footer", theme.sectionFooter)} style={style}>
            <SectionFooterContent>
                {props.children}
            </SectionFooterContent>
        </div>
    )
}

export const SectionFooterContent = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.sectionFooterContent);
    return beforeAfter(
        <span className={themedClassName("amplify-section-footer-content", theme.sectionFooterContent)} style={style}>
            {props.children}
        </span>
    )
}

export const SectionBody = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.sectionBody);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <div {...p} className={themedClassName("amplify-section-body", theme.sectionBody)} style={style}>
            {props.children}
        </div>
    )
}

export const ActionRow = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.actionRow);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <div {...p} className={themedClassName("amplify-action-row", theme.actionRow)} style={style}>
            {props.children}
        </div>
    )
}

export const FormRow = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.formRow);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <div {...p} className={themedClassName("amplify-form-row", theme.formRow)} style={style}>
            {props.children}
        </div>
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
                    className={themedClassName("amplify-input", theme.input)}
                    style={style}
                />
            )}
        </FormRow>
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
                className={themedClassName("amplify-radio", theme.radio)}
                style={style}
            />
    )
}

export const CheckboxRow = (props) => {
    const id = props.id || '_' + props.name;
    const theme = props.theme || AmplifyTheme;
    return (
        <FormRow theme={theme}>
            <Checkbox
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

export const Checkbox = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.checkbox);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <input
            {...p}
            type="checkbox"
            className={themedClassName("amplify-checkbox", theme.checkbox)}
            style={style}
        />
    )
}

export const MessageRow = (props) => {
    const theme = props.theme || AmplifyTheme;
    return (
        <FormRow theme={theme}>
            <MessageContent theme={theme}>{props.children}</MessageContent>
        </FormRow>
    )
}

export const MessageContent = (props) => {
    const theme = props.theme || AmplifyTheme;
    return beforeAfter(
        <span className={themedClassName("amplify-message-content", theme.messageContent)} style={theme.messageContent}>
            {props.children}
        </span>
    )
}

export const ButtonRow = (props) => {
    const theme = props.theme || AmplifyTheme;
    const { className, ...style } = theme.actionRow || {}
    return beforeAfter(
        <div className={themedClassName("amplify-action-row", { className })} style={style}>
            <Button {...props} />
        </div>
    )
}

export const Button = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.button);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <button {...p} className={themedClassName("amplify-button", theme.button)} style={style}>
            <ButtonContent theme={theme}>{props.children}</ButtonContent>
        </button>
    )
}

export const ButtonContent = (props) => {
    const theme = props.theme || AmplifyTheme;
    const { className, ...style } = theme.buttonContent || {}
    return beforeAfter(
        <span className={themedClassName("amplify-button-content", { className })} style={style}>
            {props.children}
        </span>
    )
}

export const SignInButton = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.signInButton);
    const p = JS.objectLessAttributes(props, 'theme');

    return beforeAfter(
        <button {...p} className={themedClassName("amplify-signin-button", theme.signInButton)} style={style}>
            {props.children}
        </button>
    )
}

export const Link = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.a);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <a {...p} className={themedClassName("amplify-a", theme.a)} style={style}>{props.children}</a>
    )
}

export const Label = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.label);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <label {...p} className={themedClassName("amplify-label", theme.label)} style={style}>{props.children}</label>
    )
}

export const Space = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.space);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <span {...p} className={themedClassName("amplify-space", theme.space)} style={style}>{props.children}</span>
    )
}

export const NavBar = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.navBar);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <div {...p} className={themedClassName("amplify-nav-bar", theme.navBar)} style={style}>
            {props.children}
        </div>
    )
}

export const Nav = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.nav);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <div {...p} className={themedClassName("amplify-nav", theme.nav)} style={style}>
            {props.children}
        </div>
    )
}

export const NavRight = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.navRight);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <div {...p} className={themedClassName("amplify-nav-right", theme.navRight)} style={style}>
            {props.children}
        </div>
    )
}

export const NavItem = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.navItem);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <div {...p} className={themedClassName("amplify-nav-item", theme.navItem)} style={style}>
            {props.children}
        </div>
    )
}

export const NavButton = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.navButton);
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <button {...p} className={themedClassName("amplify-nav-button", theme.navButton)} style={style}>
            {beforeAfter(
                <span style={theme.navButtonContent}>{props.children}</span>
            )}
        </button>
    )
}

export const beforeAfter = (el) => {
    const style = el.props.style || {};
    const { before, after } = style;
    if (!before && !after) { return el; }

    return (
        <span style={{position: 'relative'}}>
            {before? <span style={before}>{before.content}</span> : null}
            {el}
            {after? <span style={after}>{after.content}</span> : null}
        </span>
    )
}

export const propStyle = (props, themeStyle) => {
    const { id, style } = props;
    const styl = Object.assign({}, style, themeStyle);
    delete styl.className
    if (!id) { return styl; }

    const selector = '#' + id;
    Object.assign(styl, styl[selector]);
    return styl;
}

export const themedClassName = (defaultClassName, theme) => {
    if (!theme || !theme.className) {
        return defaultClassName;
    }
    return `${defaultClassName} ${theme.className || ''}`
}

export const transparent1X1 = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

export const white1X1 = 'data:image/gif;base64,R0lGODlhAQABAIAAAP7//wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';
