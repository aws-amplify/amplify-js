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
        <div v-bind:class="amplifyUI.inputLabel">{{$Amplify.I18n.get('Username')}} *</div>
        <input v-bind:class="amplifyUI.input"  v-model="options.username" :placeholder="$Amplify.I18n.get('Enter your username')" autofocus v-on:keyup.enter="signIn" />
      </div>
      <div v-bind:class="amplifyUI.formField">
        <div v-bind:class="amplifyUI.inputLabel">{{$Amplify.I18n.get('Password')}} *</div>
        <input  v-bind:class="amplifyUI.input" v-model="password" type="password" :placeholder="$Amplify.I18n.get('Enter your password')" v-on:keyup.enter="signIn" />
        <div v-bind:class="amplifyUI.hint">
          {{$Amplify.I18n.get('Forget your password? ')}}
          <a v-bind:class="amplifyUI.a" v-on:click="forgot">{{$Amplify.I18n.get('Reset password')}}</a>
        </div>
      </div>
    </div>
    <div v-bind:class="amplifyUI.sectionFooter">
      <span v-bind:class="amplifyUI.sectionFooterPrimaryContent">
        <button v-bind:class="amplifyUI.button" v-on:click="signIn">{{$Amplify.I18n.get('Sign In')}}</button>
      </span>
      <span v-bind:class="amplifyUI.sectionFooterSecondaryContent" v-if="options.isSignUpDisplayed">
        {{$Amplify.I18n.get('No account? ')}}
        <a v-bind:class="amplifyUI.a" v-on:click="signUp">{{$Amplify.I18n.get('Create account')}}</a>
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

export default {
  name: 'SignIn',
  props: ['signInConfig'],
  data () {
    return {
        password: '',
        error: '',
        amplifyUI: AmplifyUI,
        logger: {},
    }
  },
  computed: {
    options() {
      const defaults = {
        header: this.$Amplify.I18n.get('Sign In Account'),
        username: '',
        isSignUpDisplayed: true
      }
      return Object.assign(defaults, this.signInConfig || {})
    }
  },
  mounted() {
    this.logger = new this.$Amplify.Logger(this.$options.name);
  },
  methods: {
    signIn: function(event) {
      const that = this
      this.$Amplify.Auth.signIn(this.options.username, this.password)
        .then(data => {
          this.logger.info('sign in success');
          if (data.challengeName === 'SMS_MFA' || data.challengeName === 'SOFTWARE_TOKEN_MFA') {
            AmplifyEventBus.$emit('localUser', data);
            return AmplifyEventBus.$emit('authState', 'confirmSignIn')
          } else if (data.challengeName === 'NEW_PASSWORD_REQUIRED') {
            AmplifyEventBus.$emit('localUser', data);
            return AmplifyEventBus.$emit('authState', 'requireNewPassword');
          } else if (data.challengeName === 'MFA_SETUP') {
            AmplifyEventBus.$emit('localUser', data);
            return AmplifyEventBus.$emit('authState', 'setMfa');
          } else {
            return AmplifyEventBus.$emit('authState', 'signedIn')
          }
        })
        .catch((e) => {
          if (e.code && e.code === 'UserNotConfirmedException'){
            AmplifyEventBus.$emit('localUser', {username: this.options.username})
            AmplifyEventBus.$emit('authState', 'confirmSignUp')
          } else {
            this.setError(e);
          }
        });
    },
    forgot: function() {
      AmplifyEventBus.$emit('authState', 'forgotPassword')
    },
    signUp: function() {
      AmplifyEventBus.$emit('authState', 'signUp')
    },
    setError: function(e) {
      this.error = this.$Amplify.I18n.get(e.message || e);
      this.logger.error(this.error)
    }
  }
}
</script>
