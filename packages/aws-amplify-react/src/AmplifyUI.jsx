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

export const FormSection = (props) => {
    const theme = props.theme || AmplifyTheme;
    return beforeAfter(
        <div className="amplify-form-section" style={theme.formSection}>
            {props.children}
        </div>
    )
}

export const SectionHeader = (props) => {
    const theme = props.theme || AmplifyTheme;
    return beforeAfter(
        <div className="amplify-section-header" style={theme.sectionHeader}>
            {props.children}
        </div>
    )
}

export const SectionFooter = (props) => {
    const theme = props.theme || AmplifyTheme;
    return beforeAfter(
        <div className="amplify-section-footer" style={theme.sectionFooter}>
            {props.children}
        </div>
    )
}

export const SectionBody = (props) => {
    const theme = props.theme || AmplifyTheme;
    return beforeAfter(
        <div className="amplify-section-body" style={theme.sectionBody}>
            {props.children}
        </div>
    )
}

export const ActionRow = (props) => {
    const theme = props.theme || AmplifyTheme;
    return beforeAfter(
        <div className="amplify-action-row" style={theme.actionRow}>
            {props.children}
        </div>
    )
}

export const FormRow = (props) => {
    const theme = props.theme || AmplifyTheme;
    return beforeAfter(
        <div className="amplify-form-row" style={theme.formRow}>
            {props.children}
        </div>
    )
}

export const InputRow = (props) => {
    const theme = props.theme || AmplifyTheme;
    const p = JS.objectLessAttributes(props, 'theme');
    return (
        <FormRow theme={theme}>
            {beforeAfter(
                <input
                    {...p}
                    className="amplify-input"
                    style={theme.input}
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
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
            <input
                {...p}
                type="radio"
                className="amplify-radio"
                style={theme.radio}
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
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <input
            {...p}
            type="checkbox"
            className="amplify-checkbox"
            style={theme.checkbox}
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
        <span className="amplify-message-content" style={theme.messageContent}>
            {props.children}
        </span>
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
    const p = JS.objectLessAttributes(props, 'theme');

    return beforeAfter(
        <button {...p} className="amplify-button" style={theme.button}>
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

export const NavButton = (props) => {
    const theme = props.theme || AmplifyTheme;
    const p = JS.objectLessAttributes(props, 'theme');

    return beforeAfter(
        <button {...p} className="amplify-nav-button" style={theme.navButton}>
            {beforeAfter(
                <span style={theme.navButtonContent}>{props.children}</span>
            )}
        </button>
    )
}

export const Link = (props) => {
    const theme = props.theme || AmplifyTheme;
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <a {...p} className="amplify-a" style={theme.a}>{props.children}</a>
    )
}

export const Label = (props) => {
    const theme = props.theme || AmplifyTheme;
    const p = JS.objectLessAttributes(props, 'theme');
    return beforeAfter(
        <label {...p} className="amplify-label" style={theme.label}>{props.children}</label>
    )
}

export const NavBar = (props) => {
    const theme = props.theme || AmplifyTheme;
    return beforeAfter(
        <div className="amplify-nav-bar" style={theme.navBar}>
            {props.children}
        </div>
    )
}

export const NavRight = (props) => {
    const theme = props.theme || AmplifyTheme;
    return beforeAfter(
        <div className="amplify-nav-right" style={theme.navRight}>
            {props.children}
        </div>
    )
}

export const beforeAfter = (el) => {
    const style = el.props.style || {};
    const { before, after } = style;
    if (!before && !after) { return el; }

    return (
        <span>
            {before? <span style={before}>{before.content}</span> : null}
            {el}
            {after? <span style={after}>{after.content}</span> : null}
        </span>
    )
}

export const transparent1X1 = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

export const white1X1 = 'data:image/gif;base64,R0lGODlhAQABAIAAAP7//wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';
