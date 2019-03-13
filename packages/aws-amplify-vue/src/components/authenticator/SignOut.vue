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
  <div v-bind:data-test="auth.signOut.section"> 
   <div v-bind:class="amplifyUI.formField">
      <div v-bind:class="amplifyUI.inputLabel">{{options.msg}}</div>
      <button v-bind:class="amplifyUI.button" v-on:click="signOut" v-bind:data-test="auth.signOut.button">{{options.signOutButton}}</button>
    </div>      
    <div class="error" v-if="error">
      {{ error }}
    </div>
  </div>
</template>

<script>
import AmplifyEventBus from '../../events/AmplifyEventBus';
import * as AmplifyUI from '@aws-amplify/ui';
import { existsSync } from 'fs';
import { auth } from '../../assets/data-test-attributes';
import constants from './common/constants.js';

export default {
  name: 'SignOut',
  props: ['signOutConfig'],
  data () {
    return {
        error: '',
        show: false,
        amplifyUI: AmplifyUI,
        auth,
        logger: {},
    }
  },
  computed: {
    options() {
      const defaults = {
        msg: null,
        signOutButton: this.$Amplify.I18n.get('Sign Out')
      }
      return Object.assign(defaults, this.signOutConfig || {})
    }
  },
  mounted() {
    this.logger = new this.$Amplify.Logger(this.$options.name); 
  },
  methods: {
    signOut: function(event) {
      let payload = {};
      try {
        payload = JSON.parse(localStorage.getItem(constants.AUTH_SOURCE_KEY)) || {};
        localStorage.removeItem(constants.AUTH_SOURCE_KEY);
      } catch (e) {
        this.logger.debug(`Failed to parse the info from ${constants.AUTH_SOURCE_KEY} from localStorage with ${e}`);
      }

      this.logger.debug('sign out from the source', payload);
      switch (payload.provider) {
        case constants.GOOGLE:
          this.googleSignOut();
          break;
        case constants.FACEBOOK:
          this.facebookSignOut();
          break;
        case constants.AMAZON:
          this.amazonSignOut();
          break;
        default:
          break;
      }

      if (!this.$Amplify.Auth || typeof this.$Amplify.Auth.signOut !== 'function') {
          throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
      }
      
      this.$Amplify.Auth.signOut()
        .then(() => {
          this.logger.info('signout success')
          return AmplifyEventBus.$emit('authState', 'signedOut')
        })
        .catch(e => this.setError(e));
    },
    amazonSignOut: function() {
      const amz = window.amazon;
      if (!amz) {
        this.logger.debug('Amazon Login sdk undefined');
        return Promise.resolve();
      }

      this.logger.debug('Amazon signing out');
      amz.Login.logout();
    },
    facebookSignOut: function() {
      const fb = window.FB;
      if (!fb) {
        this.logger.debug('FB sdk undefined');
        return Promise.resolve();
      }

      fb.getLoginStatus(response => {
        if (response.status === 'connected') {
          return new Promise((res, rej) => {
            this.logger.debug('facebook signing out');
            fb.logout(response => {
              res(response);
            });
          });
        } else {
          return Promise.resolve();
        }
      });
    },
    googleSignOut: function() {
      const ga = window.gapi && window.gapi.auth2
        ? window.gapi.auth2.getAuthInstance() 
        : null;
      if (!ga) {
        return Promise.resolve();
      }

      ga.then((googleAuth) => {
        if (!googleAuth) {
          this.logger.debug('google Auth undefined');
          return Promise.resolve();
        }

        this.logger.debug('google signing out');
        return googleAuth.signOut();
      });
    },
    setError: function(e) {
      this.error = this.$Amplify.I18n.get(e.message || e);
      this.logger.error(this.error)
    }
  }
}
</script>
