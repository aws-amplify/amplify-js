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
		v-bind:data-test="auth.signUp.section"
	>
		<div
			v-bind:class="amplifyUI.sectionHeader"
			v-bind:data-test="auth.signUp.headerSection"
		>
			{{ this.options.header }}
		</div>
		<div
			v-bind:class="amplifyUI.sectionBody"
			v-bind:data-test="auth.signUp.bodySection"
		>
			<div
				v-bind:class="amplifyUI.formField"
				v-for="signUpField in this.orderedSignUpFields"
				:signUpField="signUpField.key"
				v-bind:key="signUpField.key"
			>
				<div v-if="signUpField.key !== 'phone_number'">
					<div v-bind:class="amplifyUI.inputLabel">
						{{ $Amplify.I18n.get(signUpField.label) }}
						{{ signUpField.required ? '*' : '' }}
					</div>
					<input
						:type="signUpField.type"
						v-bind:class="[
							amplifyUI.input,
							signUpField.invalid ? 'invalid' : '',
						]"
						v-model="signUpField.value"
						:placeholder="$Amplify.I18n.get(signUpField.label)"
						v-on:change="clear(signUpField)"
						v-bind:data-test="auth.signUp.nonPhoneNumberInput"
					/>
				</div>
				<div v-if="signUpField.key === 'phone_number'">
					<amplify-phone-field
						v-bind:required="signUpField.required"
						v-bind:invalid="signUpField.invalid"
						v-bind:placeholder="signUpField.placeholder"
						v-bind:defaultCountryCode="options.defaultCountryCode"
						v-on:phone-number-changed="phoneNumberChanged"
					/>
				</div>
			</div>
		</div>
		<div
			v-bind:class="amplifyUI.sectionFooter"
			v-bind:data-test="auth.signUp.footerSection"
		>
			<span v-bind:class="amplifyUI.sectionFooterPrimaryContent">
				<button
					v-bind:class="amplifyUI.button"
					v-on:click="signUp"
					v-bind:data-test="auth.signUp.createAccountButton"
				>
					{{ $Amplify.I18n.get('Create Account') }}
				</button>
			</span>
			<span v-bind:class="amplifyUI.sectionFooterSecondaryContent">
				{{ $Amplify.I18n.get('Have an account? ') }}
				<a
					v-bind:class="amplifyUI.a"
					v-on:click="signIn"
					v-bind:data-test="auth.signUp.signInLink"
					>{{ $Amplify.I18n.get('Sign in') }}</a
				>
			</span>
		</div>
		<div class="error" v-if="error">
			{{ error }}
		</div>
	</div>
</template>

<script>
import Vue from 'vue';
import Vue2Filters from 'vue2-filters';
import orderBy from 'lodash.orderby';
import AmplifyEventBus from '../../events/AmplifyEventBus';
import * as AmplifyUI from '@aws-amplify/ui';
import countries from '../../assets/countries';
import signUpWithUsername, {
	signUpWithEmailFields,
	signUpWithPhoneNumberFields,
} from '../../assets/default-sign-up-fields';
import { labelMap, composePhoneNumber } from './common';
import PhoneField from './PhoneField';
import { auth } from '../../assets/data-test-attributes';

Vue.use(Vue2Filters);
Vue.component('amplify-phone-field', PhoneField);

export default {
	name: 'SignUp',
	props: ['signUpConfig', 'usernameAttributes'],
	data() {
		let defaultSignUpFields = signUpWithUsername;
		if (this.usernameAttributes === 'email') {
			defaultSignUpFields = signUpWithEmailFields;
		} else if (this.usernameAttributes === 'phone_number') {
			defaultSignUpFields = signUpWithPhoneNumberFields;
		}

		return {
			auth,
			amplifyUI: AmplifyUI,
			error: '',
			logger: {},
			defaultSignUpFields,
			phoneNumber: '',
		};
	},
	computed: {
		options() {
			let header = this.$Amplify.I18n.get('Create a new account');

			if (
				this.signUpConfig &&
				this.signUpConfig.hiddenDefaults &&
				this.signUpConfig.hiddenDefaults.length > 0
			) {
				this.defaultSignUpFields = this.defaultSignUpFields.filter((d) => {
					return !this.signUpConfig.hiddenDefaults.includes(d.key);
				});
			}

			if (this.signUpConfig && this.signUpConfig.hideAllDefaults) {
				this.defaultSignUpFields = [];
			}

			// begin looping through signUpFields
			if (
				this.signUpConfig &&
				this.signUpConfig.signUpFields &&
				this.signUpConfig.signUpFields.length > 0
			) {
				// if hideAllDefaults and hideDefaults are not present on props...
				if (
					!this.signUpConfig.hideAllDefaults &&
					!this.signUpConfig.hideDefaults
				) {
					// ...add default fields to signUpField array unless user has passed in custom field with matching key
					this.defaultSignUpFields.forEach((f, i) => {
						const matchKey = this.signUpConfig.signUpFields.findIndex((d) => {
							return d.key === f.key;
						});
						if (matchKey === -1) {
							this.signUpConfig.signUpFields.push(f);
						}
					});
				}
				/* 
          sort fields based on following rules:
          1. Fields with displayOrder are sorted before those without displayOrder
          2. Fields with conflicting displayOrder are sorted alphabetically by key
          3. Fields without displayOrder are sorted alphabetically by key
        */
				this.signUpConfig.signUpFields.sort((a, b) => {
					if (a.displayOrder && b.displayOrder) {
						if (a.displayOrder < b.displayOrder) {
							return -1;
						} else if (a.displayOrder > b.displayOrder) {
							return 1;
						} else {
							if (a.key < b.key) {
								return -1;
							} else {
								return 1;
							}
						}
					} else if (!a.displayOrder && b.displayOrder) {
						return -1;
					} else if (a.displayOrder && !b.displayOrder) {
						return 1;
					} else if (!a.displayOrder && !b.displayOrder) {
						if (a.key < b.key) {
							return 1;
						} else {
							return -1;
						}
					}
				});
			}

			return Object.assign(
				{ header, signUpFields: this.defaultSignUpFields },
				this.signUpConfig || {}
			);
		},
		orderedSignUpFields: function () {
			return orderBy(this.options.signUpFields, 'displayOrder', 'name');
		},
	},
	mounted() {
		this.logger = new this.$Amplify.Logger(this.$options.name);
	},
	methods: {
		signUp: function () {
			if (!this.validate()) {
				return null;
			}

			let user = {
				attributes: {},
			};

			// puts field data into 'Auth.signUp' parameter structure
			this.options.signUpFields.forEach((e) => {
				if (e.key === 'username') {
					user.username = e.value;
				} else if (e.key === 'password') {
					user.password = e.value;
				} else if (e.key === 'phone_number' && e.value) {
					user.attributes.phone_number = e.value;
				} else {
					const newKey = `${this.needPrefix(e.key) ? 'custom:' : ''}${e.key}`;
					user.attributes[newKey] = e.value;
				}
			});

			let labelCheck = false;
			this.options.signUpFields.forEach((field) => {
				if (field.label === this.getUsernameLabel()) {
					this.logger.debug(
						`Changing the username to the value of ${field.label}`
					);
					user.username = user.attributes[field.key] || user.username;
					labelCheck = true;
				}
			});
			if (!labelCheck && !user.username) {
				// if the customer customized the username field in the sign up form
				// He needs to either set the key of that field to 'username'
				// Or make the label of the field the same as the 'usernameAttributes'
				throw new Error(
					`Couldn't find the label: ${this.getUsernameLabel()}, in sign up fields according to usernameAttributes!`
				);
			}

			this.$Amplify.Auth.signUp(user)
				.then((data) => {
					this.logger.info('sign up success');
					AmplifyEventBus.$emit('localUser', data.user);
					if (data.userConfirmed === false) {
						return AmplifyEventBus.$emit('authState', 'confirmSignUp');
					}
					return AmplifyEventBus.$emit('authState', 'signIn');
				})
				.catch((e) => this.setError(e));
		},
		validate: function () {
			let invalids = [];
			this.options.signUpFields.map((el) => {
				if (el.required && !el.value) {
					invalids.push(el.label);
					Vue.set(el, 'invalid', true);
				}
				return el;
			});
			if (invalids.length > 0) {
				this.setError(
					`The following fields must be completed: ${invalids.join(', ')}`
				);
			}
			return invalids.length < 1;
		},
		signIn: function () {
			AmplifyEventBus.$emit('authState', 'signIn');
		},
		clear(field) {
			if (field && field.invalid && field.value) {
				Vue.set(field, 'invalid', false);
			}
		},
		setError: function (e) {
			this.error = this.$Amplify.I18n.get(e.message || e);
			this.logger.error(this.error);
		},

		// determines whether or not key needs to be prepended with 'custom:' for Cognito User Pool custom attributes.
		needPrefix: function (key) {
			const field = this.options.signUpFields.find((e) => e.key === key);
			if (key.indexOf('custom:') !== 0) {
				return field.custom;
			} else if (key.indexOf('custom:') === 0 && field.custom === false) {
				this.logger.warn(
					'Custom prefix prepended to key but custom field flag is set to false'
				);
			}
			return null;
		},

		getUsernameLabel: function () {
			return labelMap[this.usernameAttributes] || this.usernameAttributes;
		},

		phoneNumberChanged: function (data) {
			const phoneNumberField = this.options.signUpFields.filter(
				(field) => field.key === 'phone_number'
			)[0];
			this.clear(phoneNumberField);
			phoneNumberField.value = composePhoneNumber(
				data.countryCode,
				data.local_phone_number
			);
		},
	},
};
</script>
