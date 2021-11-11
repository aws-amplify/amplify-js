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

import { Platform, StyleSheet } from 'react-native';

// TODO: Add more specific theme object with keys
export type AmplifyThemeType = Record<string, any>;

// Colors
export const deepSquidInk = '#152939';
export const linkUnderlayColor = '#FFF';
export const textInputColor = '#000000';
export const textInputBorderColor = '#C4C4C4';
export const placeholderColor = '#C7C7CD';
export const buttonColor = '#ff9900';
export const disabledButtonColor = '#ff990080';

// Theme
export default StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'space-around',
		paddingTop: 20,
		width: '100%',
		backgroundColor: '#FFF',
	},
	section: {
		flex: 1,
		width: '100%',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
	},
	sectionScroll: {
		flex: 1,
		width: '100%',
		paddingHorizontal: 20,
	},
	sectionHeader: {
		width: '100%',
		marginBottom: 32,
		paddingTop: 20,
	},
	sectionHeaderText: {
		color: deepSquidInk,
		fontSize: 20,
		fontWeight: '500',
	},
	sectionFooter: {
		width: '100%',
		padding: 10,
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 15,
		marginBottom: 20,
	},
	sectionFooterLink: {
		fontSize: 14,
		color: buttonColor,
		alignItems: 'baseline',
		textAlign: 'center',
	},
	sectionFooterLinkDisabled: {
		fontSize: 14,
		color: disabledButtonColor,
		alignItems: 'baseline',
		textAlign: 'center',
	},
	navBar: {
		marginTop: 35,
		padding: 15,
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	navButton: {
		marginLeft: 12,
		borderRadius: 4,
	},
	cell: {
		flex: 1,
		width: '50%',
	},
	errorRow: {
		flexDirection: 'row',
		justifyContent: 'center',
	},
	errorRowIcon: {
		height: 25,
		width: 25,
	},
	errorRowText: {
		marginLeft: 10,
	},
	photo: {
		width: '100%',
	},
	album: {
		width: '100%',
	},
	button: {
		backgroundColor: buttonColor,
		alignItems: 'center',
		padding: 16,
	},
	buttonDisabled: {
		backgroundColor: disabledButtonColor,
		alignItems: 'center',
		padding: 16,
	},
	buttonText: {
		color: '#fff',
		fontSize: 14,
		fontWeight: '600',
	},
	formField: {
		marginBottom: 22,
	},
	input: {
		padding: 16,
		borderWidth: 1,
		borderRadius: 3,
		borderColor: textInputBorderColor,
		color: textInputColor,
	},
	inputLabel: {
		marginBottom: 8,
	},
	phoneContainer: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	phoneInput: {
		flex: 2,
		padding: 16,
		borderWidth: 1,
		borderRadius: 3,
		borderColor: textInputBorderColor,
		color: textInputColor,
	},
	picker: {
		flex: 1,
		height: 44,
		// ensure that longer text values render without truncation
		// as the selected value of the Picker on Android
		minWidth: Platform.OS === 'android' ? 16 : 0,
	},
	pickerItem: {
		height: 44,
	},
	signedOutMessage: {
		textAlign: 'center',
		padding: 20,
	},
});
