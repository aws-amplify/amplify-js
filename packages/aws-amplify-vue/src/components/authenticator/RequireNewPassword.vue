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
      <div v-bind:class="amplifyUI.formField" v-if="sent">
        <div v-bind:class="amplifyUI.inputLabel">{{$Amplify.I18n.get('Code')}} *</div>
        <input v-bind:class="amplifyUI.input" v-model="code" :placeholder="$Amplify.I18n.get('Code')" autofocus />
      </div>
      <div v-bind:class="amplifyUI.formField" v-if="sent">
        <div v-bind:class="amplifyUI.inputLabel">{{$Amplify.I18n.get('New Password')}} *</div>
        <input v-bind:class="amplifyUI.input" v-model="password" type="password" :placeholder="$Amplify.I18n.get('New Password')" autofocus />
      </div>
    </div>

  <div v-bind:class="amplifyUI.sectionFooter">
      <span v-bind:class="amplifyUI.sectionFooterPrimaryContent">
        <button v-if="!sent" v-bind:class="amplifyUI.button" v-on:click="submit" :disabled="!username">{{$Amplify.I18n.get('Submit')}}</button>
      </span>
      <span v-bind:class="amplifyUI.sectionFooterSecondaryContent">
        <a v-if="!sent" v-bind:class="amplifyUI.a" v-on:click="signIn">{{$Amplify.I18n.get('Back to Sign In')}}</a>
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
  name: 'RequireNewPassword',
  props: ['requireNewPasswordConfig'],
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
    setError: function(e) {
      this.error = this.$Amplify.I18n.get(e.message || e);
      this.logger.error(this.error);
    },
    checkContact(user) {
      if (!Auth || typeof Auth.verifiedContact !== 'function') {
        throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
      }
      this.$Amplify.Auth.verifiedContact(user)
        .then(data => {
          if (!JS.isEmpty(data.verified)) {
            this.changeState('signedIn', user);
          } else {
            user = Object.assign(user, data);
            this.changeState('verifyContact', user);
          }
        });
    },
    change() {
      const user = this.props.authData;
      const { password } = this.inputs;
      const { requiredAttributes } = user.challengeParam;
      const attrs = objectWithProperties(this.inputs, requiredAttributes);

      if (!Auth || typeof Auth.completeNewPassword !== 'function') {
        throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
      }
      this.$Amplfiy.Auth.completeNewPassword(user, password, attrs)
        .then(user => {
            logger.debug('complete new password', user);
            if (user.challengeName === 'SMS_MFA') {
                AmplifyEventBus.$emit('localUser', user)
                AmplifyEventBus.$emit('authState', 'confirmSignIn')
            } else if (user.challengeName === 'MFA_SETUP') {
              AmplifyEventBus.$emit('localUser', user)
              AmplifyEventBus.$emit('authState', 'setMfa')
            } else {
              this.checkContact(user);
            }
        })
        .catch(err => this.error(err));
    }
  }
}
</script>
