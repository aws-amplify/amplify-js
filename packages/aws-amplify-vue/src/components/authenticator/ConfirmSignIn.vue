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
  <div v-bind:class="amplifyUI.formSection" v-bind:data-test="auth.confirmSignIn.section">
    <div v-bind:class="amplifyUI.sectionHeader" v-bind:data-test="auth.confirmSignIn.headerSection">{{options.header}}</div>
    <div v-bind:class="amplifyUI.sectionBody" v-bind:data-test="auth.confirmSignIn.bodySection">
      <div v-bind:class="amplifyUI.formField">
        <div v-bind:class="amplifyUI.inputLabel">{{I18n.get('Code')}} *</div>
        <input v-bind:class="amplifyUI.input" v-model="code" :placeholder="I18n.get('Code')" v-bind:data-test="auth.confirmSignIn.codeInput" />
      </div>
    </div>
    <div v-bind:class="amplifyUI.sectionFooter">
      <span v-bind:class="amplifyUI.sectionFooterPrimaryContent">
        <button v-bind:class="amplifyUI.button" v-on:click="submit" :disabled="!code" v-bind:data-test="auth.confirmSignIn.confirmButton">{{I18n.get('Confirm')}}</button>
      </span>
      <span v-bind:class="amplifyUI.sectionFooterSecondaryContent">
        <a v-bind:class="amplifyUI.a" v-on:click="signIn" v-bind:data-test="auth.confirmSignIn.backToSignInLink">{{I18n.get('Back to Sign In')}}</a>
      </span>
    </div>
    <div class="error" v-if="error">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import { CognitoUser } from '@aws-amplify/auth';
import { CognitoSigninChallenge } from 'amazon-cognito-identity-js';
import * as AmplifyUI from '@aws-amplify/ui';
import BaseComponent, { PropType } from '../base';
import AmplifyEventBus from '../../events/AmplifyEventBus';
import { auth } from '../../assets/data-test-attributes';

export interface IConfirmSignInConfig {
  header?: string;
  user?: CognitoUser;
}

export default BaseComponent.extend({
  name: 'ConfirmSignIn',
  props: {
    confirmSignInConfig: {} as PropType<IConfirmSignInConfig>,
  },
  data() {
    return {
      verifyAttr: '',
      code: '',
      amplifyUI: AmplifyUI,
      auth,
    };
  },
  computed: {
    options(): IConfirmSignInConfig {
      const defaults = {
        header: this.I18n.get('Confirm Sign In'),
        user: null,
      };
      return Object.assign(defaults, this.confirmSignInConfig || {});
    },
  },
  mounted() {
    const user = this.options.user;
    if (!user || Object.keys(user).length === 0) {
      this.setError('Valid user not received.');
    }
  },
  methods: {
    async submit() {
      const user = this.options.user;
      if (!user) {
        this.setError('Valid user not received.');
        return;
      }

      try {
        await this.Auth.confirmSignIn(
          user,
          this.code,
          user.challengeName as CognitoSigninChallenge
        );
        this.logger.info('confirmSignIn successs');
        AmplifyEventBus.$emit('authState', 'signedIn');
      } catch (e) {
        this.setError(e);
      }
    },
    signIn() {
      AmplifyEventBus.$emit('authState', 'signIn');
    },
  },
});
</script>
