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
  <div v-bind:class="amplifyUI.formSection" data-test="confirm-sign-up-section">
    <div v-bind:class="amplifyUI.sectionHeader" data-test="confirm-sign-up-header-section">{{options.header}}</div>
    <div v-bind:class="amplifyUI.sectionBody" data-test="confirm-sign-up-body-section">
      <div v-bind:class="amplifyUI.formField">
        <div v-bind:class="amplifyUI.inputLabel">{{$Amplify.I18n.get('Username')}} *</div>
        <input v-bind:class="amplifyUI.input" v-model="options.username" name="username" :placeholder="$Amplify.I18n.get('Username')" autofocus data-test="confirm-sign-up-username-input" />
      </div>
      <div v-bind:class="amplifyUI.formField">
        <div v-bind:class="amplifyUI.inputLabel">{{$Amplify.I18n.get('Confirmation Code')}} *</div>
        <input v-bind:class="amplifyUI.input" v-model="code" name="code" :placeholder="$Amplify.I18n.get('Confirmation Code')" data-test="confirm-sign-up-confirmation-code-input" />
        <div v-bind:class="amplifyUI.hint">
          {{$Amplify.I18n.get('Lost your code? ')}}
          <a v-bind:class="amplifyUI.a" v-on:click="resend" data-test="confirm-sign-up-resend-code-link">{{$Amplify.I18n.get('Resend Code')}}</a>
        </div>
      </div>
    </div>
    <div v-bind:class="amplifyUI.sectionFooter">
      <span v-bind:class="amplifyUI.sectionFooterPrimaryContent">
        <button v-bind:class="amplifyUI.button" v-on:click="confirm" data-test="confirm-sign-up-confirm-button">{{$Amplify.I18n.get('Confirm')}}</button>
      </span>
      <span v-bind:class="amplifyUI.sectionFooterSecondaryContent">
        {{$Amplify.I18n.get('Have an account? ')}}
        <a v-bind:class="amplifyUI.a" v-on:click="signIn" data-test="confirm-sign-up-back-to-sign-in-link">{{$Amplify.I18n.get('Back to Sign In')}}</a>
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
  name: 'ConfirmSignUp',
  props: ['confirmSignUpConfig'],
  data () {
    return {
        code: '',
        error: '',
        logger: {},
        amplifyUI: AmplifyUI
    }
  },
  computed: {
    options() {
      const defaults = {
        username: '',
        header: this.$Amplify.I18n.get('Confirm Sign Up'),
      }
      return Object.assign(defaults, this.confirmSignUpConfig || {})
    }
  },
  mounted: function() {
    this.logger = new this.$Amplify.Logger(this.$options.name)
    if (!this.options.username) {
      return this.setError('Valid username not received.');
    };
  },
  methods: {
    confirm() {
        this.$Amplify.Auth.confirmSignUp(this.options.username, this.code)
          .then(() => {
            this.logger.info('confirmSignUp success')
            AmplifyEventBus.$emit('authState', 'signIn')
          })
          .catch(e => this.setError(e));
    },
    resend() {
        this.$Amplify.Auth.resendSignUp(this.options.username)
            .then(() => {
              this.logger.info('resendSignUp success')
            })
            .catch(e => this.setError(e));
    },
    signIn() {
        AmplifyEventBus.$emit('authState', 'signIn')
    },
    setError(e) {
      this.error = this.$Amplify.I18n.get(e.message || e);
      this.logger.error(this.error);
    }
  }
}
</script>
