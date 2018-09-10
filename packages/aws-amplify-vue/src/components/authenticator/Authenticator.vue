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
  <div>
    <amplify-sign-in v-if="displayMap.showSignIn" v-bind:signInOptions="{username: user.username}"></amplify-sign-in>
    <amplify-sign-up v-if="displayMap.showSignUp"></amplify-sign-up>
    <amplify-confirm-sign-up v-if="displayMap.showConfirmSignUp" v-bind:confirmSignUpOptions="{username: user.username}"></amplify-confirm-sign-up>
    <amplify-confirm-sign-in v-if="displayMap.showConfirmSignIn" v-bind:confirmSignInOptions="{user: user}"></amplify-confirm-sign-in>
    <amplify-forgot-password v-if="displayMap.showForgotPassword"></amplify-forgot-password>
  </div>
</template>

<script>
import AmplifyEventBus from '../../events/AmplifyEventBus';
import GetUser from '../../services/getUser';

export default {
  name: 'Authenticator',
  props: ['authOptions'],
  data () {
    return {
        user: {
          username: null
        },
        displayMap: {},
        error: '',
        logger: {},
    }
  },
  async mounted() {
    this.logger = new this.$Amplify.Logger(this.$options.name);
    AmplifyEventBus.$on('localUser', user => {
      this.user = user;
    });
    AmplifyEventBus.$on('authState', data => {
      this.displayMap = this.updateDisplayMap(data)
    });
    GetUser(this.$Amplify).then((val) => {
      if (val instanceof Error) {
        return this.displayMap = this.updateDisplayMap('signedOut')
      }
      this.user = val;
      return this.displayMap = this.updateDisplayMap('signedIn');
    });
  },
  methods: {
    updateDisplayMap: state => {
      return {
        showSignIn: state === 'signedOut',
        showSignUp: state === 'signUp',
        showConfirmSignUp: state === 'confirmSignUp',
        showConfirmSignIn: state === 'confirmSignIn',
        showForgotPassword: state === 'forgotPassword',
        showSignOut: state === 'signedIn',
        showMfa: state === 'setMfa'
      }
    },
    setError: function(e) {
      this.error = e.message || e;
      this.logger.error(this.error)
    }
  }
}
</script>
