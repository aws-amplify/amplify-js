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

import AmplifyTheme from './AmplifyTheme';

export const Header = (props) => {
    const theme = props.theme || AmplifyTheme;
    return (
        <div className="amplify-section-header" style={theme.sectionHeader}>
            {props.children}
        </div>
    )
}

export const Footer = (props) => {
    const theme = props.theme || AmplifyTheme;
    return (
        <div className="amplify-section-footer" style={theme.sectionFooter}>
            {props.children}
        </div>
    )
}

export const InputRow = (props) => {
    const theme = props.theme || AmplifyTheme;
    props = Object.assign({}, props, {theme: null});
    return (
        <div className="amplify-form-row" style={theme.formRow}>
            <input {...props}
                className="amplify-input"
                style={theme.input}
                onChange={props.onChange}
            />
        </div>
    )
}

export const RadioRow = (props) => {
    const id = props.id || '_' + props.name;
    const theme = props.theme || AmplifyTheme;
    props = Object.assign({}, props, {theme: null});
    return (
        <div className="amplify-form-row" style={theme.formRow}>
            <input {...props}
                id={id}
                type="radio"
                className="amplify-radio"
                style={theme.radio}
                onChange={props.onChange}
            />
            <label
                htmlFor={id}
                className="amplify-label"
                style={theme.label}
            >{props.placeholder}</label>
        </div>
    )
}

export const CheckboxRow = (props) => {
    const id = props.id || '_' + props.name;
    const theme = props.theme || AmplifyTheme;
    props = Object.assign({}, props, {theme: null});
    return (
        <div className="amplify-form-row" style={theme.formRow}>
            <input {...props}
                id={id}
                type="checkbox"
                className="amplify-checkbox"
                style={theme.checkbox}
                onChange={props.onChange}
            />
            <label
                htmlFor={id}
                className="amplify-label"
                style={theme.label}
            >{props.placeholder}</label>
        </div>
    )
}

export const MessageRow = (props) => {
    const theme = props.theme || AmplifyTheme;
    return (
        <div className="amplify-form-row" style={theme.formRow}>
            {props.children}
        </div>
    )
}

export const ButtonRow = (props) => {
    const theme = props.theme || AmplifyTheme;
    props = Object.assign({}, props, {theme: null});
    return (
        <div className="amplify-action-row" style={theme.actionRow}>
            <button {...props} style={theme.button}>{props.children}</button>
        </div>
    )
}

export const Link = (props) => {
    const theme = props.theme || AmplifyTheme;
    props = Object.assign({}, props, {theme: null});
    return (
        <a {...props}  style={theme.a}>{props.children}</a>
    )
}

export const transparent1X1 = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

export const white1X1 = 'data:image/gif;base64,R0lGODlhAQABAIAAAP7//wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';
