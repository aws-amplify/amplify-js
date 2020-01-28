'use strict';
/* Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
Object.defineProperty(exports, '__esModule', { value: true });
exports.Container = {
	fontFamily: '"Amazon Ember", "Helvetica Neue", sans-serif',
	fontWeight: '400',
};
exports.FormContainer = {
	textAlign: 'center',
	marginTop: '20px',
	margin: '5% auto 50px',
};
exports.FormSection = {
	position: 'relative',
	marginBottom: '20px',
	backgroundColor: '#fff',
	padding: '35px 40px',
	textAlign: 'left',
	display: 'inline-block',
	minWidth: '380px',
	borderRadius: '6px',
	boxShadow: '1px 1px 4px 0 rgba(0,0,0,0.15)',
};
exports.FormField = {
	marginBottom: '22px',
};
exports.SectionHeader = {
	color: '#152939',
	marginBottom: '30px',
	fontSize: '18px',
	fontWeight: '500',
};
exports.SectionBody = {
	marginBottom: '30px',
};
exports.SectionFooter = {
	fontSize: '14px',
	color: '#828282',
	display: 'flex',
	flexDirection: 'row-reverse',
	alignItems: 'flex-start',
};
exports.SectionFooterPrimaryContent = {
	marginLeft: 'auto',
};
exports.SectionFooterSecondaryContent = {
	marginRight: 'auto',
	alignSelf: 'center',
};
exports.Input = {
	display: 'block',
	width: '100%',
	padding: '16px',
	fontSize: '14px',
	fontFamily: '"Amazon Ember", Arial',
	color: '#152939',
	backgroundColor: '#fff',
	backgroundImage: 'none',
	border: '1px solid #C4C4C4',
	borderRadius: '3px',
	boxSizing: 'border-box',
	marginBottom: '10px',
};
exports.Button = {
	minWidth: '153px',
	display: 'inline-block',
	marginBottom: '0',
	fontSize: '12px',
	fontWeight: 400,
	lineHeight: '1.42857143',
	textAlign: 'center',
	whiteSpace: 'nowrap',
	verticalAlign: 'middle',
	touchAction: 'manipulation',
	cursor: 'pointer',
	userSelect: 'none',
	backgroundImage: 'none',
	color: '#fff',
	backgroundColor: '#FF9900',
	borderColor: '#ccc',
	textTransform: 'uppercase',
	padding: '14px 0',
	letterSpacing: '1.1px',
	border: 'none',
};
exports.SignInButton = {
	position: 'relative',
	width: '100%',
	borderRadius: '4px',
	marginBottom: '10px',
	cursor: 'pointer',
	padding: 0,
	fontFamily: 'Amazon Ember',
	color: '#fff',
	fontSize: '14px',
	'#google_signin_btn': {
		backgroundColor: '#4285F4',
		fontFamily: 'Roboto',
		border: '1px solid #4285F4',
	},
	'#facebook_signin_btn': {
		backgroundColor: '#4267B2',
		borderColor: '#4267B2',
	},
	'#amazon_signin_btn': {
		backgroundColor: '#FF9900',
		border: 'none',
	},
};
exports.SignInButtonIcon = {
	position: 'absolute',
	left: 0,
	'#google_signin_btn_icon': {
		backgroundColor: '#fff',
		borderRadius: '4px 0 0 4px',
		height: '30px',
		width: '30px',
		padding: '11px',
	},
	'#facebook_signin_btn_icon': {
		height: '33px',
		width: '18px',
		padding: '10px 14px',
	},
	'#amazon_signin_btn_icon': {
		padding: '10px',
		height: '32px',
		width: '32px',
	},
};
exports.SignInButtonContent = {
	display: 'block',
	padding: '18px 0',
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	textAlign: 'center',
};
exports.Strike = {
	width: '100%',
	textAlign: 'center',
	borderBottom: '1px solid #bbb',
	lineHeight: '0.1em',
	margin: '32px 0',
	color: '#828282',
};
exports.StrikeContent = {
	background: '#fff',
	padding: '0 25px',
	fontSize: '14px',
	fontWeight: '500',
};
exports.ActionRow = {
	marginBottom: '15px',
};
exports.FormRow = {
	marginBottom: '12px',
};
exports.A = {
	color: '#FF9900',
	cursor: 'pointer',
};
exports.Hint = {
	color: '#828282',
	fontSize: '12px',
};
exports.Radio = {
	marginRight: '18px',
	verticalAlign: 'bottom',
};
exports.InputLabel = {
	color: '#152939',
	fontSize: '14px',
	marginBottom: '8px',
};
var Bootstrap = {
	container: exports.Container,
	formContainer: exports.FormContainer,
	formSection: exports.FormSection,
	formField: exports.FormField,
	sectionHeader: exports.SectionHeader,
	sectionBody: exports.SectionBody,
	sectionFooter: exports.SectionFooter,
	sectionFooterPrimaryContent: exports.SectionFooterPrimaryContent,
	sectionFooterSecondaryContent: exports.SectionFooterSecondaryContent,
	input: exports.Input,
	button: exports.Button,
	signInButton: exports.SignInButton,
	signInButtonIcon: exports.SignInButtonIcon,
	signInButtonContent: exports.SignInButtonContent,
	formRow: exports.FormRow,
	strike: exports.Strike,
	strikeContent: exports.StrikeContent,
	actionRow: exports.ActionRow,
	a: exports.A,
	hint: exports.Hint,
	radio: exports.Radio,
	inputLabel: exports.InputLabel,
};
exports.default = Bootstrap;
//# sourceMappingURL=Amplify-UI-Theme-Sample.js.map
