/* * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights
Reserved. * * Licensed under the Apache License, Version 2.0 (the "License").
You may not use this file except in compliance with * the License. A copy of the
License is located at * * http://aws.amazon.com/apache2.0/ * * or in the
"license" file accompanying this file. This file is distributed on an "AS IS"
BASIS, WITHOUT WARRANTIES OR * CONDITIONS OF ANY KIND, either express or
implied. See the License for the specific language governing permissions * and
limitations under the License. */

<template>
	<div v-bind:class="amplifyUI.formField">
		<div v-if="shouldRenderUsernameField">
			<div v-bind:class="amplifyUI.inputLabel">
				{{ $Amplify.I18n.get(getUsernameLabel()) }} *
			</div>
			<input
				v-bind:class="amplifyUI.input"
				v-model="username"
				:placeholder="$Amplify.I18n.get(`Enter your ${getUsernameLabel()}`)"
				autofocus
				v-on:keyup="usernameChanged"
				v-on:input="username = $event.target.value"
				v-bind:data-test="auth.genericAttrs.usernameInput"
			/>
		</div>
		<div v-if="shouldRenderEmailField">
			<div v-bind:class="amplifyUI.inputLabel">
				{{ $Amplify.I18n.get('Email') }} *
			</div>
			<input
				v-bind:class="amplifyUI.input"
				v-model="email"
				:placeholder="$Amplify.I18n.get('Enter your email')"
				autofocus
				v-on:keyup="emailChanged"
				v-on:input="email = $event.target.value"
				v-bind:data-test="auth.genericAttrs.emailInput"
			/>
		</div>
		<div v-if="shouldRenderPhoneNumberField">
			<amplify-phone-field
				v-bind:required="phoneNumberRequired"
				v-on:phone-number-changed="phoneNumberChanged"
			></amplify-phone-field>
		</div>
	</div>
</template>

<script>
import Vue from 'vue';
import * as AmplifyUI from '@aws-amplify/ui';
import countries from '../../assets/countries';
import { labelMap } from './common';
import PhoneField from './PhoneField';
import { composePhoneNumber } from './common';
import { auth } from '../../assets/data-test-attributes';

Vue.component('amplify-phone-field', PhoneField);

export default {
	name: 'UsernameField',
	props: ['usernameAttributes'],
	data() {
		return {
			username: '',
			email: '',
			amplifyUI: AmplifyUI,
			phoneNumberRequired: true,
			auth,
		};
	},
	mounted: function() {
		if (window && window.location && window.location.search) {
			const searchParams = new URLSearchParams(window.location.search);
			const usernameParam = searchParams
				? searchParams.get('username')
				: this.username;
			this.username = usernameParam;
			this.$emit('username-field-changed', {
				usernameField: 'username',
				username: usernameParam,
			});
		}
	},
	computed: {
		shouldRenderEmailField() {
			return this.usernameAttributes === 'email';
		},
		shouldRenderUsernameField() {
			return (
				this.usernameAttributes !== 'email' &&
				this.usernameAttributes !== 'phone_number'
			);
		},
		shouldRenderPhoneNumberField() {
			return this.usernameAttributes === 'phone_number';
		},
	},
	methods: {
		getUsernameLabel() {
			return labelMap[this.usernameAttributes] || this.usernameAttributes;
		},
		phoneNumberChanged(data) {
			const phoneNumber = composePhoneNumber(
				data.countryCode,
				data.local_phone_number
			);
			this.$emit('username-field-changed', {
				usernameField: 'phone_number',
				phoneNumber,
			});
		},
		emailChanged() {
			this.$emit('username-field-changed', {
				usernameField: 'email',
				email: this.email,
			});
		},
		usernameChanged() {
			this.$emit('username-field-changed', {
				usernameField: 'username',
				username: this.username,
			});
		},
	},
};
</script>
