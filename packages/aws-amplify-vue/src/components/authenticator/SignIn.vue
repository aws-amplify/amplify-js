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

<template>
  <div v-bind:class="amplifyUI.formSection" v-bind:data-test="auth.signIn.section">
    <div v-bind:class="amplifyUI.sectionHeader" v-bind:data-test="auth.signIn.headerSection">{{options.header}}</div>
    <div v-bind:class="amplifyUI.sectionBody" v-bind:data-test="auth.signIn.bodySection">
      <amplify-username-field
        v-bind:usernameAttributes="usernameAttributes"
        v-on:username-field-changed="usernameFieldChanged">
      </amplify-username-field>
      <div v-bind:class="amplifyUI.formField">
        <div v-bind:class="amplifyUI.inputLabel">{{I18n.get('Password')}} *</div>
        <input  v-bind:class="amplifyUI.input" v-model="password" type="password" :placeholder="I18n.get('Enter your password')" v-on:keyup.enter="signIn" v-bind:data-test="auth.signIn.passwordInput" />
        <div v-bind:class="amplifyUI.hint">
          {{I18n.get('Forget your password? ')}}
          <a v-bind:class="amplifyUI.a" v-on:click="forgot" v-bind:data-test="auth.signIn.forgotPasswordLink">{{I18n.get('Reset password')}}</a>
        </div>
      </div>
    </div>
    <div v-bind:class="amplifyUI.sectionFooter" v-bind:data-test="auth.signIn.footerSection">
      <span v-bind:class="amplifyUI.sectionFooterPrimaryContent">
        <button v-bind:class="amplifyUI.button" v-on:click="signIn" v-bind:data-test="auth.signIn.signInButton">{{I18n.get('Sign In')}}</button>
      </span>
      <span v-bind:class="amplifyUI.sectionFooterSecondaryContent" v-if="options.isSignUpDisplayed">
        {{I18n.get('No account? ')}}
        <a v-bind:class="amplifyUI.a" v-on:click="signUp" v-bind:data-test="auth.signIn.createAccountLink">{{I18n.get('Create account')}}</a>
      </span>
    </div>
    <div class="error" v-if="error" v-bind:data-test="auth.signIn.signInError">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import * as AmplifyUI from '@aws-amplify/ui';
import AmplifyEventBus from '../../events/AmplifyEventBus';
import BaseComponent, { PropType } from '../base';
import UsernameField from './UsernameField.vue';
import { auth } from '../../assets/data-test-attributes';

export interface ISignInConfig {
  header?: string;
  username?: string;
  isSignUpDisplayed?: boolean;
}

export default BaseComponent.extend({
  name: 'SignIn',
  components: { 'amplify-username-field': UsernameField },
  props: {
    signInConfig: {} as PropType<ISignInConfig>,
    usernameAttributes: String as PropType<string>,
  },
  data () {
    return {
      password: '',
      amplifyUI: AmplifyUI,
      auth,
      signInUsername: '',
      labelMap: {
        email: 'Email',
        phone_number: 'Phone Number',
        username: 'Username'
      },
    };
  },
  computed: {
    options(): ISignInConfig {
      const defaults = {
        header: this.I18n.get('Sign in to your account'),
        username: '',
        isSignUpDisplayed: true,
      };
      return Object.assign(defaults, this.signInConfig || {});
    },
  },
  methods: {
    async signIn(event) {
      try {
        const data = await this.Auth.signIn(this.signInUsername, this.password);
        this.logger.info('sign in success');
        if (
          data.challengeName === 'SMS_MFA' ||
          data.challengeName === 'SOFTWARE_TOKEN_MFA'
        ) {
          AmplifyEventBus.$emit('localUser', data);
          return AmplifyEventBus.$emit('authState', 'confirmSignIn');
        } else if (data.challengeName === 'NEW_PASSWORD_REQUIRED') {
          AmplifyEventBus.$emit('localUser', data);
          return AmplifyEventBus.$emit('authState', 'requireNewPassword');
        } else if (data.challengeName === 'MFA_SETUP') {
          AmplifyEventBus.$emit('localUser', data);
          return AmplifyEventBus.$emit('authState', 'setMfa');
        } else if (
          data.challengeName === 'CUSTOM_CHALLENGE' &&
          data.challengeParam &&
          data.challengeParam.trigger === 'true'
        ) {
          AmplifyEventBus.$emit('localUser', data);
          return AmplifyEventBus.$emit('authState', 'customConfirmSignIn');
        } else {
          return AmplifyEventBus.$emit('authState', 'signedIn');
        }
      } catch (e) {
        if (e.code && e.code === 'UserNotConfirmedException') {
          AmplifyEventBus.$emit('localUser', {
            username: this.signInUsername,
          });
          AmplifyEventBus.$emit('authState', 'confirmSignUp');
        } else {
          this.setError(e);
        }
      }
    },
    forgot() {
      AmplifyEventBus.$emit('authState', 'forgotPassword');
    },
    signUp() {
      AmplifyEventBus.$emit('authState', 'signUp');
    },
    usernameFieldChanged(data) {
      const { usernameField, username, email, phoneNumber } = data;
      switch (usernameField) {
        case 'username':
          this.signInUsername = username;
          break;
        case 'email':
          this.signInUsername = email;
          break;
        case 'phone_number':
          this.signInUsername = phoneNumber;
          break;
        default:
          break;
      }
    }
  }
});
</script>
