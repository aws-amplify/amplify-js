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
  <div v-bind:class="amplifyUI.formSection" data-test="forgot-password-section">
    <div v-bind:class="amplifyUI.sectionHeader" data-test="forgot-password-header-section">{{options.header}}</div>
    <div v-bind:class="amplifyUI.sectionBody" data-test="forgot-password-body-section">
      <div v-bind:class="amplifyUI.formField">
        <div v-bind:class="amplifyUI.inputLabel">{{$Amplify.I18n.get('Username')}} *</div>
        <input v-bind:class="amplifyUI.input" v-model="username" :placeholder="$Amplify.I18n.get('Enter your username')" autofocus data-test="forgot-password-username-input" />
      </div>
      <div v-bind:class="amplifyUI.formField" v-if="sent">
        <div v-bind:class="amplifyUI.inputLabel">{{$Amplify.I18n.get('Code')}} *</div>
        <input v-bind:class="amplifyUI.input" v-model="code" :placeholder="$Amplify.I18n.get('Code')" autofocus data-test="forgot-password-code-input" />
      </div>
      <div v-bind:class="amplifyUI.formField" v-if="sent">
        <div v-bind:class="amplifyUI.inputLabel">{{$Amplify.I18n.get('New Password')}} *</div>
        <input v-bind:class="amplifyUI.input" v-model="password" type="password" :placeholder="$Amplify.I18n.get('New Password')" autofocus data-test="forgot-password-new-password-input" />
      </div>
    </div>

  <div v-bind:class="amplifyUI.sectionFooter" data-test="forgot-password-section-footer">
      <span v-bind:class="amplifyUI.sectionFooterPrimaryContent">
        <button v-if="!sent" v-bind:class="amplifyUI.button" v-on:click="submit" :disabled="!username" data-test="forgot-password-send-code-button">{{$Amplify.I18n.get('Send Code')}}</button>
        <button v-if="sent" v-bind:class="amplifyUI.button" v-on:click="verify" :disabled="!username" data-test="forgot-password-submit-button">{{$Amplify.I18n.get('Submit')}}</button>
      </span>
      <span v-bind:class="amplifyUI.sectionFooterSecondaryContent">
        <a v-if="!sent" v-bind:class="amplifyUI.a" v-on:click="signIn" data-test="forgot-password-back-to-sign-in-link">{{$Amplify.I18n.get('Back to Sign In')}}</a>
        <a v-if="sent" v-bind:class="amplifyUI.a" v-on:click="submit" data-test="forgot-password-resend-code-link">{{$Amplify.I18n.get('Resend Code')}}</a>
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

export default {
  name: 'ForgotPassword',
  props: ['forgotPasswordConfig'],
  data () {
    return {
        username: '',
        code: '',
        password: '',
        error: '',
        sent: false,
        logger: {},
        amplifyUI: AmplifyUI
    }
  },
  computed: {
    options() {
      const defaults = {
        header: this.$Amplify.I18n.get('Reset your password'),
      }
      return Object.assign(defaults, this.forgotPasswordConfig || {})
    }
  },
  mounted() {
    this.logger = new this.$Amplify.Logger(this.$options.name)
  },
  methods: {
    submit: function() {
      this.$Amplify.Auth.forgotPassword(this.username)
        .then(() => {
          this.sent = true;
          this.logger.info('forgotPassword success');
        })
        .catch(e => this.setError(e));
    },
    verify: function() {
      this.$Amplify.Auth.forgotPasswordSubmit(this.username, this.code, this.password)
        .then(() => {
          this.logger.info('forgotPasswordSubmit success');
          AmplifyEventBus.$emit('authState', 'signIn');
        })
        .catch(e => this.setError(e));
    },
    signIn: function() {
      AmplifyEventBus.$emit('authState', 'signIn');
    },
    setError: function(e) {
      this.error = this.$Amplify.I18n.get(e.message || e);
      this.logger.error(this.error);
    }
  }
}
</script>
