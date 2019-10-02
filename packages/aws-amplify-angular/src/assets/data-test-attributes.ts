// tslint:disable
/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
// tslint:enable
// Auth
const signIn = {
	section: 'sign-in-section',
	headerSection: 'sign-in-header-section',
	bodySection: 'sign-in-body-section',
	footerSection: 'sign-in-footer-section',
	usernameInput: 'username-input',
	passwordInput: 'sign-in-password-input',
	forgotPasswordLink: 'sign-in-forgot-password-link',
	signInButton: 'sign-in-sign-in-button',
	createAccountLink: 'sign-in-create-account-link',
	signInError: 'authenticator-error',
};

const signOut = {
	button: 'sign-out-button',
	section: 'sign-out-section',
};

const signUp = {
	section: 'sign-up-section',
	headerSection: 'sign-up-header-section',
	bodySection: 'sign-up-body-section',
	nonPhoneNumberInput: 'sign-up-non-phone-number-input',
	phoneNumberInput: 'sign-up-phone-number-input',
	dialCodeSelect: 'sign-up-dial-code-select',
	footerSection: 'sign-up-footer-section',
	createAccountButton: 'sign-up-create-account-button',
	signInLink: 'sign-up-sign-in-link',
	signUpButton: 'sign-up-sign-up-button',
	signInButton: 'sign-up-sign-in-button',
	confirmButton: 'sign-up-confirm-button',
};

const verifyContact = {
	section: 'verify-contact-section',
	headerSection: 'verify-contact-header-section',
	bodySection: 'verify-contact-body-section',
	submitButton: 'verify-contact-submit-button',
	verifyButton: 'verify-contact-verify-button',
	skipLink: 'verify-contact-skip-link',
};

const TOTPSetup = {
	component: 'totp-setup-component',
};

const requireNewPassword = {
	section: 'require-new-password-section',
	headerSection: 'require-new-password-header-section',
	footerSection: 'require-new-password-footer-section',
	bodySection: 'require-new-password-body-section',
	newPasswordInput: 'require-new-password-new-password-input',
	backToSignInLink: 'require-new-password-back-to-sign-in-link',
	submitButton: 'require-new-password-submit-button',
};

const loading = {
	section: 'loading-secton',
};

const greetings = {
	navBar: 'greetings-nav-bar',
	nav: 'greetings-nav',
	navRight: 'greetings-nav-right',
};

// TODO: Change Angular Component (Greeting) to match React Component (Greetings)
const greeting = {
	signOutButton: 'sign-out-button',
	signOutLink: 'greeting-sign-out-link',
	navRight: 'greetings-nav-right',
};

const federatedSignIn = {
	section: 'federated-sign-in-section',
	bodySection: 'federated-sign-in-body-section',
	signInButtons: 'federated-sign-in-buttons',
};

const confirmSignUp = {
	section: 'confirm-sign-up-section',
	headerSection: 'confirm-sign-up-header-section',
	bodySection: 'confirm-sign-up-body-section',
	usernameInput: 'confirm-sign-up-username-input',
	confirmationCodeInput: 'confirm-sign-up-confirmation-code-input',
	resendCodeLink: 'confirm-sign-up-resend-code-link',
	confirmButton: 'confirm-sign-up-confirm-button',
	backToSignInLink: 'confirm-sign-up-back-to-sign-in-link',
};

const confirmSignIn = {
	section: 'confirm-sign-in-section',
	headerSection: 'confirm-sign-in-header-section',
	bodySection: 'confirm-sign-in-body-section',
	codeInput: 'confirm-sign-in-code-input',
	confirmButton: 'confirm-sign-in-confirm-button',
	backToSignInLink: 'confirm-sign-in-back-to-sign-in-link',
};

const setMFAComp = {
	section: 'set-mfa-section',
	headerSection: 'set-mfa-header-section',
	bodySection: 'set-mfa-header-body-section',
	smsInput: 'set-mfa-sms-input',
	totpInput: 'set-mfa-totp-input',
	noMfaInput: 'set-mfa-nomfa-input',
	verificationCodeInput: 'set-mfa-verification-code-input',
	setMfaButton: 'set-mfa-set-mfa-button',
	verifyTotpTokenButton: 'set-mfa-verify-totp-token-button',
	cancelButton: 'set-mfa-cancel-button',
};

const forgotPassword = {
	section: 'forgot-password-section',
	headerSection: 'forgot-password-header-section',
	bodySection: 'forgot-password-body-section',
	submitButton: 'forgot-password-submit-button',
	sendCodeButton: 'forgot-password-send-code-button',
	resendCodeLink: 'forgot-password-resend-code-link',
	backToSignInLink: 'forgot-password-back-to-sign-in-link',
	usernameInput: 'username-input',
	codeInput: 'forgot-password-code-input',
	newPasswordInput: 'forgot-password-new-password-input',
};

export const sumerianScene = {
	container: 'sumerian-scene-container',
	sumerianScene: 'sumerian-scene',
	loading: 'sumerian-scene-loading',
	loadingLogo: 'sumerian-scene-loading-logo',
	loadingSceneName: 'sumerian-scene-loading-scene-name',
	loadingBar: 'sumerian-scene-loading-bar',
	errorText: 'sumerian-scene-error-text',
	bar: 'sumerian-scene-bar',
	actions: 'sumerian-scene-actions',
};

export const genericAttrs = {
	usernameInput: 'username-input',
	emailInput: 'email-input',
	phoneNumberInput: 'phone-number-input',
	dialCodeSelect: 'dial-code-select',
};

export const chatBot = {
	title: 'chatbot-title',
	dialog: 'chatbot-dialog',
	messageInput: 'chatbot-message-input',
	sendMessageButton: 'chatbot-send-message-button',
};

export const auth = {
	signIn,
	signOut,
	signUp,
	verifyContact,
	TOTPSetup,
	requireNewPassword,
	loading,
	genericAttrs,
	greetings,
	greeting,
	federatedSignIn,
	confirmSignUp,
	confirmSignIn,
	setMFAComp,
	forgotPassword,
};
