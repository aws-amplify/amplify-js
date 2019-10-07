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
    <amplify-sign-in v-if="displayMap.showSignIn" v-bind:signInConfig="options.signInConfig" v-bind:usernameAttributes="options.usernameAttributes"></amplify-sign-in>
    <amplify-sign-up v-if="displayMap.showSignUp" v-bind:signUpConfig="options.signUpConfig" v-bind:usernameAttributes="options.usernameAttributes"></amplify-sign-up>
    <amplify-confirm-sign-up v-if="displayMap.showConfirmSignUp" v-bind:confirmSignUpConfig="options.confirmSignUpConfig" v-bind:usernameAttributes="options.usernameAttributes"></amplify-confirm-sign-up>
    <amplify-confirm-sign-in v-if="displayMap.showConfirmSignIn" v-bind:confirmSignInConfig="options.confirmSignInConfig"></amplify-confirm-sign-in>
    <amplify-forgot-password v-if="displayMap.showForgotPassword" v-bind:forgotPasswordConfig="options.forgotPasswordConfig" v-bind:usernameAttributes="options.usernameAttributes"></amplify-forgot-password>
    <amplify-require-new-password v-if="displayMap.requireNewPassword" v-bind:requireNewPasswordConfig="options.requireNewPasswordConfig"></amplify-require-new-password>
    <amplify-set-mfa v-if="displayMap.showMfa" v-bind:mfaConfig="options.mfaConfig"></amplify-set-mfa>
  </div>
</template>

<script lang="ts">
import { CognitoUser } from '@aws-amplify/auth';
import BaseComponent, { PropType } from '../base';
import AmplifyEventBus from '../../events/AmplifyEventBus';
import GetUser from '../../services/getUser';
import { IConfirmSignInConfig } from './ConfirmSignIn.vue';
import { IConfirmSignUpConfig } from './ConfirmSignUp.vue';
import { IForgotPasswordConfig } from './ForgotPassword.vue';
import { IRequireNewPasswordConfig } from './RequireNewPassword.vue';
import { IMFAConfig } from './SetMFA.vue';
import { ISignInConfig } from './SignIn.vue';
import { ISignUpConfig } from './SignUp.vue';

interface IAuthConfig {
  signInConfig: ISignInConfig;
  signUpConfig: ISignUpConfig;
  confirmSignUpConfig: IConfirmSignUpConfig;
  confirmSignInConfig: IConfirmSignInConfig;
  forgotPasswordConfig: IForgotPasswordConfig;
  mfaConfig: IMFAConfig;
  requireNewPasswordConfig: IRequireNewPasswordConfig;
  usernameAttributes: string;
}

interface IDisplayMap {
  showSignIn: boolean;
  showSignUp: boolean;
  showConfirmSignUp: boolean;
  showConfirmSignIn: boolean;
  showForgotPassword: boolean;
  showSignOut: boolean;
  showMfa: boolean;
  requireNewPassword: boolean;
}

export default BaseComponent.extend({
  name: 'Authenticator',
  props: {
    authConfig: {} as PropType<IAuthConfig>,
  },
  data() {
    return {
      user: null as CognitoUser,
      displayMap: {},
    };
  },
  computed: {
    options(): IAuthConfig {
      const defaults = {
        signInConfig: {},
        signUpConfig: {},
        confirmSignUpConfig: {},
        confirmSignInConfig: {},
        forgotPasswordConfig: {},
        mfaConfig: {},
        requireNewPasswordConfig: {},
        usernameAttributes: 'username',
      };
      return Object.assign(defaults, this.authConfig || {});
    },
  },
  async mounted(): Promise<void> {
    AmplifyEventBus.$on('localUser', (user: CognitoUser) => {
      this.user = user;
      const options = this.options;
      options.signInConfig.username = user.getUsername();
      options.confirmSignInConfig.user = user;
      options.confirmSignUpConfig.username = user.getUsername();
      options.requireNewPasswordConfig.user = user;
    });

    AmplifyEventBus.$on('authState', data => {
      this.displayMap = this.updateDisplayMap(data);
    });

    try {
      const val = await GetUser(this.$Amplify);
      if (val instanceof Error) {
        this.displayMap = this.updateDisplayMap('signedOut');
        return;
      }
      this.user = val;
      this.displayMap = this.updateDisplayMap('signedIn');
    } catch (e) {
      this.setError(e);
    }
  },
  methods: {
    updateDisplayMap(state): IDisplayMap {
      return {
        showSignIn: state === 'signedOut' || state === 'signIn',
        showSignUp: state === 'signUp',
        showConfirmSignUp: state === 'confirmSignUp',
        showConfirmSignIn: state === 'confirmSignIn',
        showForgotPassword: state === 'forgotPassword',
        showSignOut: state === 'signedIn',
        showMfa: state === 'setMfa',
        requireNewPassword: state === 'requireNewPassword',
      };
    }
  }
});
</script>
