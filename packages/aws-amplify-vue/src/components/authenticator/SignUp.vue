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
    <div v-bind:class="amplifyUI.sectionHeader">Sign Up</div>
    <div v-bind:class="amplifyUI.sectionBody">
      <div v-bind:class="amplifyUI.formField">
        <div v-bind:class="amplifyUI.inputLabel">Username *</div>
        <input v-bind:class="amplifyUI.input" v-model="username" placeholder="Username" autofocus />
      </div>
      <div v-bind:class="amplifyUI.formField">
        <div v-bind:class="amplifyUI.inputLabel">Password *</div>
        <input v-bind:class="amplifyUI.input" v-model="password" type="password" placeholder="Password" />
      </div>
      <div v-bind:class="amplifyUI.formField">
        <div v-bind:class="amplifyUI.inputLabel">Email *</div>
        <input  v-bind:class="amplifyUI.input" v-model="email" placeholder="Email" />
      </div>
      <div v-bind:class="amplifyUI.formField">
        <div v-bind:class="amplifyUI.inputLabel">Phone Number *</div>
        <div v-bind:class="amplifyUI.selectInput">
          <select v-model="country">
            <option v-for="country in countries" v-bind:key="country.label">{{country.label}}</option>
          </select>
          <input  v-bind:class="amplifyUI.input" v-model="phone_number" placeholder="Phone Number" />
        </div>
      </div>
    </div>
    <div v-bind:class="amplifyUI.sectionFooter">
      <span v-bind:class="amplifyUI.sectionFooterPrimaryContent">
        <button v-bind:class="amplifyUI.button" v-on:click="signUp" :disabled="!username || !password || !email || !phone_number ">Create Account</button>
      </span>
      <span v-bind:class="amplifyUI.sectionFooterSecondaryContent">
        Have an Account?
        <a v-bind:class="amplifyUI.a" v-on:click="signIn">Sign In</a>
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
import countries from '../../assets/countries';

export default {
  name: 'SignUp',
  props: ['signUpOptions'],
  data () {
    return {
      username: '',
      password: '',
      email: '',
      country: 'USA (+1)',
      countryCode: '1',
      phone_number: '',
      countries,
      amplifyUI: AmplifyUI,
      logger: {},
    }
  },
  computed: {
    options() {
      const defaults = {
        header: 'Sign Up',
      }
      return Object.assign(defaults, this.signUpOptions || {})
    }
  },
  mounted() {
    this.logger = new this.$Amplify.Logger(this.$options.name);
  },
  watch: {
    /* 
    this operation is in place to avoid making country.value the select box 
    bound key, which results in a duplicate key error in console
    */
    country: function() {
      this.countryCode = this.countries.find(c => c.label === this.country).value
    }
  },
  methods: {
    signUp: function() {
       this.$Amplify.Auth.signUp(this.username, this.password, this.email, `+${this.countryCode}${this.phone_number}`)
            .then(data => {
              this.logger.info('sign up success');
              AmplifyEventBus.$emit('localUser', data.user)
              if (data.userConfirmed === false){
                return AmplifyEventBus.$emit('authState', 'confirmSignUp');
              }
              return AmplifyEventBus.$emit('authState', 'signedOut')
            })
            .catch(e => this.setError(e));

    },
    signIn: function() {
      AmplifyEventBus.$emit('authState', 'signedOut')
    },
    setError: function(e) {
      this.error = e.message || e;
      this.logger.error(this.error) 
    },
  }
}
</script>
