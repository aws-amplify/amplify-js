/* * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights
Reserved. * * Licensed under the Apache License, Version 2.0 (the "License").
You may not use this file except in compliance with * the License. A copy of the
License is located at * * http://aws.amazon.com/apache2.0/ * * or in the
"license" file accompanying this file. This file is distributed on an "AS IS"
BASIS, WITHOUT WARRANTIES OR * CONDITIONS OF ANY KIND, either express or
implied. See the License for the specific language governing permissions * and
limitations under the License. */

<template>
	<div
		v-bind:class="amplifyUI.formSection"
		v-bind:data-test="auth.setMFAComp.section"
	>
		<div v-bind:class="amplifyUI.sectionHeader" v-if="!displayTotpSetup">
			{{ options.header }}
			<div style="font-size: 16px; color: #828282; margin-top: 10px">
				{{ options.mfaDescription }}
			</div>
		</div>
		<div
			v-bind:class="amplifyUI.sectionHeader"
			v-if="displayTotpSetup"
			v-bind:data-test="auth.setMFAComp.headerSection"
		>
			{{ $Amplify.I18n.get('Verify Authentication Token') }}
			<div style="font-size: 16px; color: #828282; margin-top: 10px">
				{{ options.tokenInstructions }}
			</div>
		</div>
		<div
			v-bind:class="amplifyUI.sectionBody"
			v-if="!displayTotpSetup"
			v-bind:data-test="auth.setMFAComp.bodySection"
		>
			<div
				v-bind:class="amplifyUI.formField"
				v-if="options.mfaTypes.includes('SMS')"
			>
				<div v-bind:class="amplifyUI.inputLabel">
					<input
						v-bind:class="amplifyUI.radio"
						type="radio"
						name="mfaPreference"
						value="SMS"
						v-model="mfaPreference"
						v-bind:data-test="auth.setMFAComp.smsInput"
					/>
					{{ options.smsDescription }}
				</div>
			</div>
			<div
				v-bind:class="amplifyUI.formField"
				v-if="options.mfaTypes.includes('TOTP')"
			>
				<div v-bind:class="amplifyUI.inputLabel">
					<input
						v-bind:class="amplifyUI.radio"
						type="radio"
						name="mfaPreference"
						value="TOTP"
						v-model="mfaPreference"
						v-bind:data-test="auth.setMFAComp.totpInput"
					/>
					{{ options.totpDescription }}
				</div>
			</div>
			<div
				v-bind:class="amplifyUI.formField"
				v-if="options.mfaTypes.includes('None')"
			>
				<div v-bind:class="amplifyUI.inputLabel">
					<input
						v-bind:class="amplifyUI.radio"
						type="radio"
						name="mfaPreference"
						value="NOMFA"
						v-model="mfaPreference"
						v-bind:data-test="auth.setMFAComp.noMfaInput"
					/>
					{{ options.noMfaDescription }}
				</div>
			</div>
		</div>
		<div v-bind:class="amplifyUI.sectionBody" v-if="displayTotpSetup">
			<qrcode-vue
				v-bind:class="amplifyUI.totpQrcode"
				:value="token"
				:size="300"
				level="H"
			></qrcode-vue>
			<div v-bind:class="amplifyUI.formField">
				<div v-bind:class="amplifyUI.inputLabel">
					{{ $Amplify.I18n.get('Verification Code') }} *
				</div>
				<input
					v-bind:class="amplifyUI.input"
					v-model="code"
					:placeholder="$Amplify.I18n.get('Verification Code')"
					autofocus
					v-bind:data-test="auth.setMFAComp.verificationCodeInput"
				/>
			</div>
		</div>
		<div v-bind:class="amplifyUI.sectionFooter">
			<span v-bind:class="amplifyUI.sectionFooterPrimaryContent">
				<button
					id="setMfa"
					v-bind:class="amplifyUI.button"
					v-on:click="setMFA"
					v-if="!displayTotpSetup"
					v-bind:data-test="auth.setMFAComp.setMfaButton"
				>
					{{ $Amplify.I18n.get('Set MFA') }}
				</button>
				<button
					id="verify"
					v-bind:class="amplifyUI.button"
					v-on:click="verifyTotpToken"
					v-if="displayTotpSetup"
					v-bind:data-test="auth.setMFAComp.verifyTotpTokenButton"
				>
					{{ $Amplify.I18n.get('Verify Token') }}
				</button>
			</span>
			<span v-bind:class="amplifyUI.sectionFooterSecondaryContent">
				<a
					v-bind:class="amplifyUI.a"
					v-on:click="cancel"
					v-bind:data-test="auth.setMFAComp.cancelButton"
					>{{ $Amplify.I18n.get('Cancel') }}</a
				>
			</span>
		</div>
		<div class="error" v-if="error">
			{{ error }}
		</div>
	</div>
</template>

<script>
// import Auth from '@aws-amplify/auth';
import AmplifyEventBus from '../../events/AmplifyEventBus';
import * as AmplifyUI from '@aws-amplify/ui';
import QrcodeVue from 'qrcode.vue';
import { auth } from '../../assets/data-test-attributes';

export default {
	name: 'SetMfa',
	props: ['mfaConfig'],
	data() {
		return {
			user: null,
			mfaPreference: null,
			code: null,
			token: '',
			error: '',
			displayTotpSetup: false,
			amplifyUI: AmplifyUI,
			auth,
			logger: {},
		};
	},
	components: {
		QrcodeVue,
	},
	mounted() {
		this.logger = new this.$Amplify.Logger(this.$options.name);
		this.setUser();
	},
	computed: {
		options() {
			const defaults = {
				header: 'Multifactor Authentication Preference',
				mfaDescription:
					'AWS Multi-Factor Authentication (MFA) adds an extra layer of protection on top of your user name and password.',
				tokenInstructions:
					'Scan the QR Code with your phone camera or authentication app to get the MFA code.',
				smsDescription:
					'SMS text messaging (receive a code on your mobile device)',
				totpDescription:
					'One-time password (use a QR code and MFA app to save a token on your mobile device)',
				noMfaDescription: 'Do not enable MFA',
				mfaTypes: [],
			};
			return Object.assign(defaults, this.mfaConfig || {});
		},
	},
	watch: {
		mfaPreference(value) {
			if (value === 'TOTP') {
				this.setup();
			}
		},
	},
	methods: {
		setup() {
			this.$Amplify.Auth.setupTOTP(this.user)
				.then((data) => {
					this.logger.info('setTOTP success');
					this.token =
						'otpauth://totp/AWSCognito:' +
						this.user.username +
						'?secret=' +
						data +
						'&issuer=AWSCognito';
				})
				.catch((e) => this.setError(e));
		},
		setUser: async function () {
			await this.$Amplify.Auth.currentAuthenticatedUser()
				.then((user) => {
					this.logger.info('currentAuthenticatedUser success');
					if (user) {
						this.user = user;
					} else {
						this.user = null;
					}
					return this.user;
				})
				.catch((e) => {
					this.user = null;
					this.setError(e);
					return this.user;
				});
		},
		setMFA: function () {
			this.$Amplify.Auth.setPreferredMFA(this.user, this.mfaPreference)
				.then((data) => {
					AmplifyEventBus.$emit('authState', 'signedIn');
					this.$destroy();
				})
				.catch((e) => {
					if ((e.message = 'User has not verified software token mfa')) {
						return (this.displayTotpSetup = true);
					}
					this.setError(e);
				});
		},
		verifyTotpToken() {
			this.$Amplify.Auth.verifyTotpToken(this.user, this.code)
				.then(() => {
					this.logger.info('verifyTotpToken success');
					this.setMFA();
				})
				.catch((e) => this.setError(e));
		},
		setError: function (e) {
			this.error = this.$Amplify.I18n.get(e.message || e);
			this.logger.error(this.error);
		},
		cancel: function () {
			return this.options.cancelHandler ? this.options.cancelHandler() : null;
		},
	},
};
</script>
