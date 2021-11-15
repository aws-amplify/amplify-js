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
		v-bind:data-test="auth.requireNewPassword.section"
	>
		<div
			v-bind:class="amplifyUI.sectionHeader"
			v-bind:data-test="auth.requireNewPassword.headerSection"
		>
			{{ options.header }}
		</div>
		<div
			v-bind:class="amplifyUI.sectionBody"
			v-bind:data-test="auth.requireNewPassword.bodySection"
		>
			<div v-bind:class="amplifyUI.formField">
				<div v-bind:class="amplifyUI.inputLabel">
					{{ $Amplify.I18n.get('New Password') }} *
				</div>
				<input
					v-bind:class="amplifyUI.input"
					v-model="password"
					type="password"
					:placeholder="$Amplify.I18n.get('New Password')"
					autofocus
					v-bind:data-test="auth.requireNewPassword.newPasswordInput"
				/>
			</div>
		</div>
		<div
			v-bind:class="amplifyUI.formField"
			v-for="attribute in options.user.challengeParam.requiredAttributes"
			:attribute="attribute"
			v-bind:key="attribute"
		>
			<div v-bind:class="amplifyUI.inputLabel">
				{{ attribute.charAt(0).toUpperCase() + attribute.slice(1) }}
			</div>
			<input
				v-bind:class="amplifyUI.input"
				v-model="requiredAttributes[attribute]"
				:placeholder="attribute.charAt(0).toUpperCase() + attribute.slice(1)"
			/>
		</div>
		<div
			v-bind:class="amplifyUI.sectionFooter"
			v-bind:data-test="auth.requireNewPassword.footerSection"
		>
			<span v-bind:class="amplifyUI.sectionFooterPrimaryContent">
				<button
					v-bind:class="amplifyUI.button"
					v-on:click="change"
					:disabled="!password"
					v-bind:data-test="auth.requireNewPassword.submitButton"
				>
					{{ $Amplify.I18n.get('Submit') }}
				</button>
			</span>
			<span v-bind:class="amplifyUI.sectionFooterSecondaryContent">
				<a
					v-bind:class="amplifyUI.a"
					v-on:click="signIn"
					v-bind:data-test="auth.requireNewPassword.backToSignInLink"
					>{{ $Amplify.I18n.get('Back to Sign In') }}</a
				>
			</span>
		</div>
		<div class="error" v-if="error">
			{{ error }}
		</div>
	</div>
</template>
<script>
import AmplifyEventBus from '../../events/AmplifyEventBus';
import * as AmplifyUI from '@aws-amplify/ui';
import { auth } from '../../assets/data-test-attributes';

export default {
	name: 'RequireNewPassword',
	props: ['requireNewPasswordConfig'],
	data() {
		return {
			user: '',
			error: '',
			password: '',
			logger: {},
			requiredAttributes: {},
			amplifyUI: AmplifyUI,
			auth,
		};
	},
	computed: {
		options() {
			const defaults = {
				header: this.$Amplify.I18n.get('Enter new password'),
				user: {
					challengeParam: {
						requiredAttributes: [],
					},
				},
			};
			return Object.assign(defaults, this.requireNewPasswordConfig || {});
		},
	},
	mounted() {
		this.logger = new this.$Amplify.Logger(this.$options.name);
	},
	methods: {
		setError: function (e) {
			this.error = this.$Amplify.I18n.get(e.message || e);
			this.logger.error(this.error);
		},
		checkContact(user) {
			this.$Amplify.Auth.verifiedContact(user)
				.then((data) => {
					AmplifyEventBus.$emit('localUser', this.user);
					AmplifyEventBus.$emit('authState', 'signedIn');
				})
				.catch((e) => this.setError(e));
		},
		change() {
			this.$Amplify.Auth.completeNewPassword(
				this.options.user,
				this.password,
				this.requiredAttributes
			)
				.then((user) => {
					if (this.options.user.challengeName === 'SMS_MFA') {
						AmplifyEventBus.$emit('localUser', this.options.user);
						AmplifyEventBus.$emit('authState', 'confirmSignIn');
					} else if (this.options.user.challengeName === 'MFA_SETUP') {
						AmplifyEventBus.$emit('localUser', this.options.user);
						AmplifyEventBus.$emit('authState', 'setMfa');
					} else {
						this.checkContact(this.options.user);
					}
				})
				.catch((err) => this.setError(err));
		},
		signIn: function () {
			AmplifyEventBus.$emit('authState', 'signIn');
		},
	},
};
</script>
