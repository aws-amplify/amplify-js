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
  <div v-bind:class="applyClasses('formSection')">
    <div v-bind:class="applyClasses('sectionHeader')">{{options.header}}</div>
    <div v-bind:class="applyClasses('sectionBody')">
      <div v-bind:class="applyClasses('formField')">
        <div v-bind:class="applyClasses('inputLabel')">{{$Amplify.I18n.get('Username')}} *</div>
        <input v-bind:class="applyClasses('input')" v-model="username" :placeholder="$Amplify.I18n.get('Enter your username')" autofocus />
      </div>
      <div v-bind:class="applyClasses('formField')" v-if="sent">
        <div v-bind:class="applyClasses('inputLabel')">{{$Amplify.I18n.get('Code')}} *</div>
        <input v-bind:class="applyClasses('input')" v-model="code" :placeholder="$Amplify.I18n.get('Code')" autofocus />
      </div>
      <div v-bind:class="applyClasses('formField')" v-if="sent">
        <div v-bind:class="applyClasses('inputLabel')">{{$Amplify.I18n.get('New Password')}} *</div>
        <input v-bind:class="applyClasses('input')" v-model="password" type="password" :placeholder="$Amplify.I18n.get('New Password')" autofocus />
      </div>
    </div>

  <div v-bind:class="applyClasses('sectionFooter')">
      <span v-bind:class="applyClasses('sectionFooterPrimaryContent')">
        <button v-if="!sent" v-bind:class="applyClasses('button')" v-on:click="submit" :disabled="!username">{{$Amplify.I18n.get('Send Code')}}</button>
        <button v-if="sent" v-bind:class="applyClasses('button')" v-on:click="verify" :disabled="!username">{{$Amplify.I18n.get('Submit')}}</button>
      </span>
      <span v-bind:class="applyClasses('sectionFooterSecondaryContent')">
        <a v-if="!sent" v-bind:class="applyClasses('a')" v-on:click="signIn">{{$Amplify.I18n.get('Back to Sign In')}}</a>
        <a v-if="sent" v-bind:class="applyClasses('a')" v-on:click="submit">{{$Amplify.I18n.get('Resend Code')}}</a>
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
  props: ['forgotPasswordConfig', 'classOverrides'],
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
          AmplifyEventBus.$emit('authState', 'signedOut');
        })
        .catch(e => this.setError(e));
    },
    signIn: function() {
      AmplifyEventBus.$emit('authState', 'signedOut');
    },
    setError: function(e) {
      this.error = this.$Amplify.I18n.get(e.message || e);
      this.logger.error(this.error);
    },
    applyClasses: function(element) {
      const classes = [
        AmplifyUI[element],
        ...(this.classOverrides && this.classOverrides[element] ? this.classOverrides[element] : []),
        ...(this.forgotPasswordConfig.classOverrides && this.forgotPasswordConfig.classOverrides[element] ? this.forgotPasswordConfig.classOverrides[element] : [])
      ];
      return classes;
    }
  }
}
</script>
