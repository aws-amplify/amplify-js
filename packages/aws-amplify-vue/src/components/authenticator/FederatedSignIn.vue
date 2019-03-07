<template>
  <div>
    <div v-if="google_client_id">
      <google-button :google_client_id="google_client_id"/>
    </div>
    <div v-if="facebook_app_id">
      <facebook-button :facebook_app_id="facebook_app_id"/>
    </div>
    <div v-if="amazon_client_id">
      <amazon-button :amazon_client_id="amazon_client_id"/>
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
    amazon_client_id: {
      type: String,
      required: false,
      default: ''
    },
    google_client_id: {
      type: String,
      required: false,
      default: ''
    },
    facebook_app_id: {
      type: String,
      required: false,
      default: ''
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
  methods: {},
  mounted: function() {}
}
</script>
