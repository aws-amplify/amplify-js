<template>
  <div>
    <div v-if="options.google_client_id">
      <google-button :google_client_id="options.google_client_id"></google-button>
    </div>
    <div v-if="options.facebook_app_id">
      <facebook-button :facebook_app_id="options.facebook_app_id"></facebook-button>
    </div>
    <div v-if="options.amazon_client_id">
      <amazon-button :amazon_client_id="options.amazon_client_id"></amazon-button>
    </div>
  </div>    
</template>

<script>
import * as AmplifyUI from '@aws-amplify/ui';
import FacebookButton from './Provider/FacebookButton';
import GoogleButton from './Provider/GoogleButton';
import AmazonButton from './Provider/AmazonButton';

export default {
  name: 'FederatedSignIn',
  props: {
    federatedSignInConfig: {
      type: Object,
      required: false
    }
  },
  components: {
    FacebookButton,
    GoogleButton,
    AmazonButton
  },
  data: () => ({
    amplifyUI: AmplifyUI
  }),
  computed: {
    options: function() {
      const defaults = {
        facebook_app_id: '',
        google_client_id: '',
        amazon_client_id: ''
      }
      return Object.assign(defaults, this.federatedSignInConfig || {})
    }
  },
  methods: {},
  mounted: function() {}
}
</script>
