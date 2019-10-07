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
  <div v-bind:class="amplifyUI.formSection" v-bind:data-test="auth.forgotPassword.section">
    <div v-bind:class="amplifyUI.sectionHeader" v-bind:data-test="auth.forgotPassword.headerSection">{{options.header}}</div>
    <div v-bind:class="amplifyUI.sectionBody" v-bind:data-test="auth.forgotPassword.bodySection">
      <amplify-username-field
        v-bind:usernameAttributes="usernameAttributes"
        v-on:username-field-changed="usernameFieldChanged">
      </amplify-username-field>
      <div v-bind:class="amplifyUI.formField" v-if="sent">
        <div v-bind:class="amplifyUI.inputLabel">{{I18n.get('Code')}} *</div>
        <input v-bind:class="amplifyUI.input" v-model="code" :placeholder="I18n.get('Code')" autofocus v-bind:data-test="auth.forgotPassword.codeInput" />
      </div>
      <div v-bind:class="amplifyUI.formField" v-if="sent">
        <div v-bind:class="amplifyUI.inputLabel">{{I18n.get('New Password')}} *</div>
        <input v-bind:class="amplifyUI.input" v-model="password" type="password" :placeholder="I18n.get('New Password')" autofocus v-bind:data-test="auth.forgotPassword.newPasswordInput" />
      </div>
    </div>

  <div v-bind:class="amplifyUI.sectionFooter">
      <span v-bind:class="amplifyUI.sectionFooterPrimaryContent">
        <button v-if="!sent" v-bind:class="amplifyUI.button" v-on:click="submit" :disabled="!forgotPwUsername" v-bind:data-test="auth.forgotPassword.sendCodeButton">{{I18n.get('Send Code')}}</button>
        <button v-if="sent" v-bind:class="amplifyUI.button" v-on:click="verify" :disabled="!forgotPwUsername" v-bind:data-test="auth.forgotPassword.submitButton">{{I18n.get('Submit')}}</button>
      </span>
      <span v-bind:class="amplifyUI.sectionFooterSecondaryContent">
        <a v-if="!sent" v-bind:class="amplifyUI.a" v-on:click="signIn" v-bind:data-test="auth.forgotPassword.backToSignInLink">{{I18n.get('Back to Sign In')}}</a>
        <a v-if="sent" v-bind:class="amplifyUI.a" v-on:click="submit" v-bind:data-test="auth.forgotPassword.resentCodeLink">{{I18n.get('Resend Code')}}</a>
      </span>
    </div>
    <div class="error" v-if="error">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import * as AmplifyUI from '@aws-amplify/ui';
import BaseComponent, { PropType } from '../base';
import AmplifyEventBus from '../../events/AmplifyEventBus';
import UsernameField from './UsernameField.vue';
import { auth } from '../../assets/data-test-attributes';

export interface IForgotPasswordConfig {
  header?: string;
}

export default BaseComponent.extend({
  name: 'ForgotPassword',
  components: { 'amplify-username-field': UsernameField },
  props: {
    forgotPasswordConfig: {} as PropType<IForgotPasswordConfig>,
    usernameAttributes: String as PropType<string>,
  },
  data() {
    return {
      code: '',
      password: '',
      sent: false,
      amplifyUI: AmplifyUI,
      forgotPwUsername: '',
      auth,
    };
  },
  computed: {
    options(): IForgotPasswordConfig {
      const defaults = {
        header: this.I18n.get('Reset your password'),
      };
      return Object.assign(defaults, this.forgotPasswordConfig || {});
    },
  },
  methods: {
    async submit() {
      try {
        await this.Auth.forgotPassword(this.forgotPwUsername);
        this.sent = true;
        this.logger.info('forgotPassword success');
      } catch (e) {
        this.setError(e);
      }
    },
    async verify() {
      try {
        await this.Auth.forgotPasswordSubmit(
          this.forgotPwUsername,
          this.code,
          this.password
        );
        this.logger.info('forgotPasswordSubmit success');
        AmplifyEventBus.$emit('authState', 'signIn');
      } catch (e) {
        this.setError(e);
      }
    },
    signIn() {
      AmplifyEventBus.$emit('authState', 'signIn');
    },
    usernameFieldChanged(data) {
      const { usernameField, username, email, phoneNumber } = data;
      switch (usernameField) {
        case 'username':
          this.forgotPwUsername = username;
          break;
        case 'email':
          this.forgotPwUsername = email;
          break;
        case 'phone_number':
          this.forgotPwUsername = phoneNumber;
          break;
        default:
          break;
      }
    },
  },
});
</script>
