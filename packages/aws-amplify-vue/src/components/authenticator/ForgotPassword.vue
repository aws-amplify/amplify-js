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
      <div v-bind:class="amplifyUI.formField">
        <div v-bind:class="amplifyUI.inputLabel">{{$Amplify.I18n.get('Username')}} *</div>
        <input v-bind:class="amplifyUI.input" v-model="username" :placeholder="$Amplify.I18n.get('Enter your username')" autofocus v-bind:data-test="auth.forgotPassword.usernameInput" />
      </div>
      <div v-bind:class="amplifyUI.formField" v-if="sent">
        <div v-bind:class="amplifyUI.inputLabel">{{$Amplify.I18n.get('Code')}} *</div>
        <input v-bind:class="amplifyUI.input" v-model="code" :placeholder="$Amplify.I18n.get('Code')" autofocus v-bind:data-test="auth.forgotPassword.codeInput" />
      </div>
      <div v-bind:class="amplifyUI.formField" v-if="sent">
        <div v-bind:class="amplifyUI.inputLabel">{{$Amplify.I18n.get('New Password')}} *</div>
        <input v-bind:class="amplifyUI.input" v-model="password" type="password" :placeholder="$Amplify.I18n.get('New Password')" autofocus v-bind:data-test="auth.forgotPassword.newPasswordInput" />
      </div>
    </div>

  <div v-bind:class="amplifyUI.sectionFooter">
      <span v-bind:class="amplifyUI.sectionFooterPrimaryContent">
        <button v-if="!sent" v-bind:class="amplifyUI.button" v-on:click="submit" :disabled="!username" v-bind:data-test="auth.forgotPassword.sendCodeButton">{{$Amplify.I18n.get('Send Code')}}</button>
        <button v-if="sent" v-bind:class="amplifyUI.button" v-on:click="verify" :disabled="!username" v-bind:data-test="auth.forgotPassword.submitButton">{{$Amplify.I18n.get('Submit')}}</button>
      </span>
      <span v-bind:class="amplifyUI.sectionFooterSecondaryContent">
        <a v-if="!sent" v-bind:class="amplifyUI.a" v-on:click="signIn" v-bind:data-test="auth.forgotPassword.backToSignInLink">{{$Amplify.I18n.get('Back to Sign In')}}</a>
        <a v-if="sent" v-bind:class="amplifyUI.a" v-on:click="submit" v-bind:data-test="auth.forgotPassword.resentCodeLink">{{$Amplify.I18n.get('Resend Code')}}</a>
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
        amplifyUI: AmplifyUI,
        auth
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
