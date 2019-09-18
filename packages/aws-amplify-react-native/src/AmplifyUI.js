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

import React, { Component } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableHighlight,
	TouchableOpacity,
	Picker,
} from 'react-native';
import { I18n } from 'aws-amplify';
import AmplifyTheme, {
	linkUnderlayColor,
	errorIconColor,
} from './AmplifyTheme';
import { Icon } from 'react-native-elements';
import countryDialCodes from './CountryDialCodes';

export const FormField = props => {
	const theme = props.theme || AmplifyTheme;
	return (
		<View style={theme.formField}>
			<Text style={theme.inputLabel}>
				{props.label} {props.required ? '*' : ''}
			</Text>
			<TextInput
				style={theme.input}
				autoCapitalize="none"
				autoCorrect={false}
				{...props}
			/>
		</View>
	);
};

export class PhoneField extends Component {
	constructor(props) {
		super(props);

		this.state = {
			dialCode: this.props.defaultDialCode || '+1',
			phone: '',
		};
	}

	onChangeText() {
		const { dialCode, phone } = this.state;
		const cleanedPhone = phone.replace(/[^0-9.]/g, '') || '';
		const phoneNumber = cleanedPhone === '' ? '' : `${dialCode}${cleanedPhone}`;
		this.props.onChangeText(phoneNumber);
	}

	render() {
		const { label, required } = this.props;
		const theme = this.props.theme || AmplifyTheme;

		return (
			<View style={theme.formField}>
				<Text style={theme.inputLabel}>
					{label} {required ? '*' : ''}
				</Text>
				<View style={theme.phoneContainer}>
					<Picker
						style={theme.picker}
						selectedValue={this.state.dialCode}
						itemStyle={theme.pickerItem}
						onValueChange={dialCode => {
							this.setState({ dialCode }, () => {
								this.onChangeText();
							});
						}}
					>
						{countryDialCodes.map(dialCode => (
							<Picker.Item key={dialCode} value={dialCode} label={dialCode} />
						))}
					</Picker>
					<TextInput
						style={theme.phoneInput}
						autoCapitalize="none"
						autoCorrect={false}
						{...this.props}
						onChangeText={phone => {
							this.setState({ phone }, () => {
								this.onChangeText();
							});
						}}
					/>
				</View>
			</View>
		);
	}
}

export const SectionFooter = props => {
	const theme = props.theme || AmplifyTheme;
	return (
		<View style={theme.sectionFooter}>
			<LinkCell theme={theme} onPress={() => onStateChange('confirmSignUp')}>
				{I18n.get('Confirm a Code')}
			</LinkCell>
			<LinkCell theme={theme} onPress={() => onStateChange('signIn')}>
				{I18n.get('Sign In')}
			</LinkCell>
		</View>
	);
};

export const LinkCell = props => {
	const theme = props.theme || AmplifyTheme;
	return (
		<View style={theme.cell}>
			<TouchableHighlight
				onPress={props.onPress}
				underlayColor={linkUnderlayColor}
			>
				<Text style={theme.sectionFooterLink}>{props.children}</Text>
			</TouchableHighlight>
		</View>
	);
};

export const Header = props => {
	const theme = props.theme || AmplifyTheme;
	return (
		<View style={theme.sectionHeader}>
			<Text style={theme.sectionHeaderText}>{props.children}</Text>
		</View>
	);
};

export const ErrorRow = props => {
	const theme = props.theme || AmplifyTheme;
	if (!props.children) return null;
	return (
		<View style={theme.errorRow}>
			<Icon name="warning" color={errorIconColor} />
			<Text style={theme.errorRowText}>{props.children}</Text>
		</View>
	);
};

export const AmplifyButton = props => {
	const theme = props.theme || AmplifyTheme;
	let style = theme.button;
	if (props.disabled) {
		style = theme.buttonDisabled;
	}

	if (props.style) {
		style = [style, props.style];
	}

	return (
		<TouchableOpacity {...props} style={style}>
			<Text style={theme.buttonText}>{props.text}</Text>
		</TouchableOpacity>
	);
};
