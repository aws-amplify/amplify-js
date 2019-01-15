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
      <div v-if="!codeSent" v-bind:class="amplifyUI.hint">
        {{options.verificationMessage}}
      </div>
      <br />
      <div v-if="!codeSent && options.user.unverified.email">
        <input type="radio" v-model="attribute" value ="email">
        Email: {{options.user.unverified.email}}
      </div>
      <div v-if="!codeSent && options.user.unverified.phone_number && options.allowPhone">
        <input type="radio" v-model="attribute" value="phone_number">
        Phone Number: {{options.user.unverified.phone_number}}
      </div>
      <div v-if="codeSent" v-bind:class="amplifyUI.formField">
        <div v-bind:class="amplifyUI.inputLabel">{{$Amplify.I18n.get('Code')}} *</div>
        <input v-bind:class="amplifyUI.input" v-model="code" :placeholder="$Amplify.I18n.get('Enter Code')" autofocus />
      </div>
    </div>
    <div v-bind:class="amplifyUI.sectionFooter">
      <span v-bind:class="amplifyUI.sectionFooterPrimaryContent">
        <button v-if="!codeSent" v-bind:class="amplifyUI.button" v-on:click="verify">{{$Amplify.I18n.get('Verify')}}</button>
        <button v-if="codeSent" v-bind:class="amplifyUI.button" v-on:click="submit">{{$Amplify.I18n.get('Submit')}}</button>
      </span>
      <span v-bind:class="amplifyUI.sectionFooterSecondaryContent">
        <a v-bind:class="amplifyUI.a" v-on:click="skip">{{$Amplify.I18n.get('Skip')}}</a>
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
  name: 'VerifyContact',
  props: ['verifyContactConfig'],
  data () {
    return {
        user: '',
        error: '',
        codeSent: false,
        logger: {},
        attribute: 'email',
        amplifyUI: AmplifyUI
    }
  },
  computed: {
    options() {
      const defaults = {
        header: 'Verify Contact Information',
        verificationMessage: `It is recommended that you verify your contact information.  
        A message will be sent to the contact option that you select.`,
        user: {
          unverified: {}
        }
      }
      return Object.assign(defaults, this.verifyContactConfig || {})
    }
  },
  mounted() {
    this.logger = new this.$Amplify.Logger(this.$options.name)
    if (!this.options.user || !this.options.user.unverified) {
      this.setError('No user to verify');
      return AmplifyEventBus.$emit('authState', 'signedIn')
    }
    if (this.options.skipVerification) {
      return AmplifyEventBus.$emit('authState', 'signedIn')
    }
  },
  methods: {
    verify: function() {
      this.error = null;
      if (!this.options.user) {
        return this.setError('No user for email verification.');
      }
      this.$Amplify.Auth.verifyCurrentUserAttribute(this.attribute)
        .then(() => {
            return this.codeSent = true;
        })
        .catch(err => this.setError(err));
    },
    submit: function() {
      if (!this.code) {
        return this.setError('No code present.');
      }
      this.$Amplify.Auth.verifyCurrentUserAttributeSubmit(this.attribute, this.code)
          .then(data => {
            AmplifyEventBus.$emit('authState', 'signedIn');
          })
          .catch(err => this.setError(err));
    },
    setError: function(e) {
      this.error = this.$Amplify.I18n.get(e.message || e);
      this.logger.error(this.error);
    },
    skip: function() {
      return AmplifyEventBus.$emit('authState', 'signedIn')
    }
  }
}
</script>