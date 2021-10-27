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

import React, { Component, FC } from 'react';
import {
	Image,
	Keyboard,
	Picker,
	Platform,
	Text,
	TextInput,
	TouchableHighlight,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
	SafeAreaView,
	TextInputProperties,
	TouchableOpacityProps,
} from 'react-native';
import { I18n } from 'aws-amplify';
import AmplifyTheme, {
	AmplifyThemeType,
	linkUnderlayColor,
	placeholderColor,
} from './AmplifyTheme';
import countryDialCodes from './CountryDialCodes';
import TEST_ID from './AmplifyTestIDs';
import icons from './icons';
import { setTestId } from './Utils'

interface IContainerProps {
	theme?: AmplifyThemeType;
}

export const Container: FC<IContainerProps> = props => {
	const theme = props.theme || AmplifyTheme;
	return <SafeAreaView style={theme.container}>{props.children}</SafeAreaView>;
};

interface IFormFieldProps extends TextInputProperties {
	label: string;
	required?: boolean;
	theme?: AmplifyThemeType;
}

export const FormField: FC<IFormFieldProps> = props => {
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
				placeholderTextColor={placeholderColor}
				{...props}
			/>
		</View>
	);
};

interface IPhoneProps extends TextInputProperties {
	defaultDialCode?: string;
	label: string;
	onChangeText: (phoneNumber: string) => void;
	required?: boolean;
	theme?: AmplifyThemeType;
	value?: string;
}

interface IPhoneState {
	dialCode: string;
	phone: string;
}

export class PhoneField extends Component<IPhoneProps, IPhoneState> {
	constructor(props: IPhoneProps) {
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
		const { label, required, value } = this.props;
		const { dialCode } = this.state;
		const theme = this.props.theme || AmplifyTheme;

		const phoneValue = value ? value.replace(dialCode, '') : undefined;

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
						placeholderTextColor={placeholderColor}
						{...this.props}
						value={phoneValue}
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

interface ILinkCellProps {
	disabled?: boolean;
	onPress: () => void;
	testID?: string;
	theme?: AmplifyThemeType;
}

export const LinkCell: FC<ILinkCellProps> = props => {
	const { disabled } = props;
	const theme = props.theme || AmplifyTheme;
	return (
		<View style={theme.cell}>
			<TouchableHighlight
				onPress={props.onPress}
				underlayColor={linkUnderlayColor}
				{...setTestId(props.testID)}
				disabled={disabled}
			>
				<Text
					style={
						disabled ? theme.sectionFooterLinkDisabled : theme.sectionFooterLink
					}
				>
					{props.children}
				</Text>
			</TouchableHighlight>
		</View>
	);
};

interface IHeaderProps {
	testID?: string;
	theme?: AmplifyThemeType;
}

export const Header: FC<IHeaderProps> = props => {
	const theme = props.theme || AmplifyTheme;
	return (
		<View style={theme.sectionHeader}>
			<Text style={theme.sectionHeaderText} {...setTestId(props.testID)}>
				{props.children}
			</Text>
		</View>
	);
};

interface IErrorRowProps {
	theme?: AmplifyThemeType;
}

export const ErrorRow: FC<IErrorRowProps> = props => {
	const theme = props.theme || AmplifyTheme;
	if (!props.children) return null;
	return (
		<View style={theme.errorRow}>
			<Image source={icons.warning} style={theme.errorRowIcon} />
			<Text style={theme.errorRowText} {...setTestId(TEST_ID.AUTH.ERROR_ROW_TEXT)}>
				{props.children}
			</Text>
		</View>
	);
};

interface IAmplifyButtonProps extends TouchableOpacityProps {
	disabled?: boolean;
	style?: object;
	text: string;
	theme?: AmplifyThemeType;
}

export const AmplifyButton: FC<IAmplifyButtonProps> = props => {
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

interface IWrapperProps {
	style?: AmplifyThemeType;
	accessible?: boolean;
	onPress?: Function;
}

export const Wrapper: FC<IWrapperProps> = props => {
	const isWeb = Platform.OS === 'web';
	const WrapperComponent: React.ElementType = isWeb
		? View
		: TouchableWithoutFeedback;

	const wrapperProps: IWrapperProps = {
		style: AmplifyTheme.section,
		accessible: false,
	};

	if (!isWeb) {
		wrapperProps.onPress = Keyboard.dismiss;
	}

	return (
		<WrapperComponent {...wrapperProps}>{props.children}</WrapperComponent>
	);
};

export const SignedOutMessage = props => {
	const theme = props.theme || AmplifyTheme;
	const message =
		props.signedOutMessage || I18n.get('Please Sign In / Sign Up');
	return (
		<Text
			style={theme.signedOutMessage}
			{...setTestId(TEST_ID.AUTH.GREETING_SIGNED_OUT_TEXT)}
		>
			{message}
		</Text>
	);
};
