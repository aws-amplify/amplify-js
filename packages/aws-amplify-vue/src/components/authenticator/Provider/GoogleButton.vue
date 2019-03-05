<template>
  <button :id="amplifyUI.googleSignInButton" :class="amplifyUI.signInButton" variant="googleSignInButton" @click="signIn">
    <span :class="amplifyUI.signInButtonIcon">
      <svg viewBox="0 0 256 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"/><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"/><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"/><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"/></svg>
    </span>
    <span :class="amplifyUI.signInButtonContent">
        {{$Amplify.I18n.get('Sign In with Google')}}
    </span>
  </button>
</template>

<script>
import AmplifyEventBus from '../../../events/AmplifyEventBus';
import * as AmplifyUI from '@aws-amplify/ui';
import constants from '../common/constants.js';

export default {
  name: 'GoogleButton',
  props: {
    google_client_id: {
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
    initGapi: function() {
      this.logger.debug('init gapi');

      const ga = window.gapi;
      const self = this;
      ga.load('auth2', function() {
          ga.auth2.init({
              client_id: self.google_client_id,
              scope: 'profile email openid'
          });
      });
    },
    createScript: function() {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/platform.js';
      script.async = true;
      script.onload = this.initGapi;
      document.body.appendChild(script);
    },
    signIn: function() {
      const ga = window.gapi.auth2.getAuthInstance();

      ga.signIn().then(
        googleUser => {
          this.federatedSignIn(googleUser);
          const payload = { provider: constants.GOOGLE };

          try {
            localStorage.setItem(constants.AUTH_SOURCE_KEY, JSON.stringify(payload));
          } catch (e) {
            this.logger.debug('Failed to cache auth source into localStorage', e);
          }
        },
        error => this.logger.error(this.error)
      );
    },
    federatedSignIn: function(googleUser) {
      const { id_token, expires_at } = googleUser.getAuthResponse();
      const profile = googleUser.getBasicProfile();
      let user = {
        email: profile.getEmail(),
        name: profile.getName(),
        picture: profile.getImageUrl(),
      };

      if (!this.$Amplify.Auth || 
        typeof this.$Amplify.Auth.federatedSignIn !== 'function' || 
        typeof this.$Amplify.Auth.currentAuthenticatedUser !== 'function') {
        throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
      }

      this.$Amplify.Auth.federatedSignIn('google', {
        token: id_token,
        expires_at
      }, user)
      .then(credentials => AmplifyEventBus.$emit('authState', 'signedIn'))
      .catch(error => this.logger.error(this.error))
    }
  },
  created: function() {
    this.logger = new this.$Amplify.Logger(this.$options.name);
  },
  mounted: function() {
    const ga = window.gapi && window.gapi.auth2 
      ? window.gapi.auth2.getAuthInstance() 
      : null;
    if (this.google_client_id && !ga) this.createScript();
  }
}
</script>
