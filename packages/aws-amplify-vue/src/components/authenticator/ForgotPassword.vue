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
  <div v-bind:class="amplifyUI.formSection">
    <div v-bind:class="amplifyUI.sectionHeader">{{options.header}}</div>
    <div v-bind:class="amplifyUI.sectionBody">
      <div v-bind:class="amplifyUI.formField">
        <div v-bind:class="amplifyUI.inputLabel">Username *</div>
        <input v-bind:class="amplifyUI.input" v-model="username" placeholder="Username" autofocus />
      </div>
      <div v-bind:class="amplifyUI.formField" v-if="sent">
        <div v-bind:class="amplifyUI.inputLabel">Verification Code *</div>
        <input v-bind:class="amplifyUI.input" v-model="code" placeholder="Verification Code" autofocus />
      </div>
      <div v-bind:class="amplifyUI.formField" v-if="sent">
        <div v-bind:class="amplifyUI.inputLabel">New Password *</div>
        <input v-bind:class="amplifyUI.input" v-model="password" type="password" placeholder="New Password" autofocus />
      </div>
    </div>

  <div v-bind:class="amplifyUI.sectionFooter">
      <span v-bind:class="amplifyUI.sectionFooterPrimaryContent">
        <button v-if="!sent" v-bind:class="amplifyUI.button" v-on:click="submit" :disabled="!username">Submit</button>
        <button v-if="sent" v-bind:class="amplifyUI.button" v-on:click="verify" :disabled="!username">Verify</button>
      </span>
      <span v-bind:class="amplifyUI.sectionFooterSecondaryContent">
        <a v-if="!sent" v-bind:class="amplifyUI.a" v-on:click="signIn">Back to Sign In</a>
        <a v-if="sent" v-bind:class="amplifyUI.a" v-on:click="submit">Resend Code</a>
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
        header: 'Forgot Password',
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
          AmplifyEventBus.$emit('authState', 'signedOut');
        })
        .catch(e => this.setError(e));
    },
    signIn: function() {
      AmplifyEventBus.$emit('authState', 'signedOut');
    },
    setError: function(e) {
      this.error = e.message || e;
      this.logger.error(this.error);
    }
  }
}
</script>
