/*
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
  <button :id="amplifyUI.facebookSignInButton" :class="amplifyUI.signInButton" variant="facebookSignInButton" @click="signIn">
    <span :class="amplifyUI.signInButtonIcon">
      <svg viewBox='0 0 279 538' xmlns='http://www.w3.org/2000/svg'><g id='Page-1' fill='none' fillRule='evenodd'><g id='Artboard' fill='#FFF'><path d='M82.3409742,538 L82.3409742,292.936652 L0,292.936652 L0,196.990154 L82.2410458,196.990154 L82.2410458,126.4295 C82.2410458,44.575144 132.205229,0 205.252865,0 C240.227794,0 270.306232,2.59855099 279,3.79788222 L279,89.2502322 L228.536175,89.2502322 C188.964542,89.2502322 181.270057,108.139699 181.270057,135.824262 L181.270057,196.89021 L276.202006,196.89021 L263.810888,292.836708 L181.16913,292.836708 L181.16913,538 L82.3409742,538 Z' id='Fill-1' /></g></g></svg>
    </span>
    <span :class="amplifyUI.signInButtonContent">
        {{ $Amplify.I18n.get('Sign In with Facebook') }}
    </span>
  </button>
</template>

<script>
import AmplifyEventBus from '../../../events/AmplifyEventBus';
import * as AmplifyUI from '@aws-amplify/ui';
import constants from '../common/constants.js';

export default {
  name: 'FacebookButton',
  props: {
    facebookAppId: {
      type: String,
      required: true,
      validator: (val) => {
        return val.length > 0
      }
    }
  },
  data: () => ({
    amplifyUI: AmplifyUI,
    logger: {}
  }),
  methods: {
    initFB: function() {
      const fb = window.FB;
      this.logger.debug('FB inited');
    },
    createScript: function() {
      window.fbAsyncInit = this.fbAsyncInit;

      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.onload = this.initFB;
      document.body.appendChild(script);
    },
    fbAsyncInit: function() {
      this.logger.debug('init FB');

      const fb = window.FB;
      fb.init({
        appId   : this.facebookAppId,
        cookie  : true,
        xfbml   : true,
        version : 'v2.11'
      });

      fb.getLoginStatus(response => this.logger.debug(response));
    },
    signIn: function() {
      const fb = window.FB;
  
      fb.getLoginStatus(response => {
        const payload = { provider: constants.FACEBOOK };
        try {
          localStorage.setItem(constants.AUTH_SOURCE_KEY, JSON.stringify(payload));
        } catch (e) {
          this.logger.debug('Failed to cache auth source into localStorage', e);
        }
        if (response.status === 'connected') {
          this.federatedSignIn(response.authResponse);
        } else {
          fb.login(response => {
              if (!response || !response.authResponse) {
                  return;
              }
              this.federatedSignIn(response.authResponse);
            },
            {
              scope: 'public_profile,email'
            }
          );
        }
      });
    },
    federatedSignIn: function(response) {
      this.logger.debug(response);

      const { accessToken, expiresIn } = response;
      const date = new Date();
      const expires_at = expiresIn * 1000 + date.getTime();
      if (!accessToken) {
          return;
      }

      const fb = window.FB;
      fb.api('/me', { fields: 'name,email' }, response => {
        const user = {
          name: response.name,
          email: response.email
        };
        if (!this.$Amplify.Auth || 
          typeof this.$Amplify.Auth.federatedSignIn !== 'function' || 
          typeof this.$Amplify.Auth.currentAuthenticatedUser !== 'function') {
          throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
        }
        
        this.$Amplify.Auth.federatedSignIn('facebook', { 
          token: accessToken, 
          expires_at 
        }, user)
        .then(credentials => AmplifyEventBus.$emit('authState', 'signedIn'))
        .catch(error => this.logger.error(error))
      });
    }
  },
  created: function() {
    this.logger = new this.$Amplify.Logger(this.$options.name);
  },
  mounted: function() {
    if (this.facebookAppId && !window.FB) this.createScript();
  }
}
</script>
