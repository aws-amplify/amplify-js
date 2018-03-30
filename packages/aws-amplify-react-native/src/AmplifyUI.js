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
import { View, Text, TextInput, TouchableHighlight, Button } from 'react-native';

import { I18n, JS } from 'aws-amplify';

export const Username = (props) => {
    const theme = props.theme || AmplifyTheme;
    return (
        <TextInput
            style={theme.input}
            placeholder={I18n.get('Username')}
            autoFocus={true}
            autoCapitalize="none"
            {...props}
        />
    )
}

export const Password = (props) => {
    const theme = props.theme || AmplifyTheme;
    return (
        <TextInput
            style={theme.input}
            placeholder={I18n.get('Password')}
            secureTextEntry={true}
            {...props}
        />
    )
}

export const Email = (props) => {
    const theme = props.theme || AmplifyTheme;
    return (
        <TextInput
            style={theme.input}
            placeholder={I18n.get('Email')}
            keyboardType="email-address"
            autoCapitalize="none"
            {...props}
        />
    )
}

export const PhoneNumber = (props) => {
    const theme = props.theme || AmplifyTheme;
    return (
        <TextInput
            style={theme.input}
            placeholder={I18n.get('Phone Number')}
            keyboardType="phone-pad"
            {...props}
        />
    )
}

export const ConfirmationCode = (props) => {
    const theme = props.theme || AmplifyTheme;
    return (
        <TextInput
            style={theme.input}
            placeholder={I18n.get('Code')}
            autoFocus={true}
            {...props}
        />
    )
}

export const LinkCell = (props) => {
    const theme = props.theme || AmplifyTheme;
    return (
        <View style={theme.cell}>
            <TouchableHighlight
                onPress={props.onPress}
            >
                <Text style={theme.sectionFooterLink}>{props.children}</Text>
            </TouchableHighlight>
        </View>
    )
}

export const Header = (props) => {
    const theme = props.theme || AmplifyTheme;
    return (
        <View style={theme.sectionHeader}>
            <Text style={theme.sectionHeaderText}>{props.children}</Text>
        </View>
    )
}

export const ErrorRow = (props) => {
    const theme = props.theme || AmplifyTheme;
    return (
        <View style={theme.errorRow}>
            <Text style={theme.erroRowText}>{props.children}</Text>
        </View>
    )
}

export const ActionRow = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.actionRow);
    const p = JS.objectLessAttributes(props, 'theme');
    return (
        <View {...p}  style={style}>
            {props.children}
        </View>
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

export const SignInButton = (props) => {
    const theme = props.theme || AmplifyTheme;
    const style = propStyle(props, theme.signInButton);
    const p = JS.objectLessAttributes(props, 'theme');

    return (
        <Button {...p} className="amplify-signin-button" style={style}>
            {props.children}
        </Button>
    )
}


