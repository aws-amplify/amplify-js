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
    <div v-bind:class="amplifyUI.sectionHeader">{{this.options.header}}</div>
    <div v-bind:class="amplifyUI.sectionBody">
      <div v-bind:class="amplifyUI.formField" 
          v-for="signUpField in orderBy(this.options.signUpFields, 'displayOrder')" 
          :signUpField="signUpField" 
          v-bind:key="signUpField.key"
        >
        <div v-bind:class="amplifyUI.inputLabel">{{signUpField.label}} {{signUpField.required ? '*': ''}}</div>
        <input 
            v-if="signUpField.key !== 'phone_number'" 
            :type = "signUpField.type" 
            v-bind:class="[amplifyUI.input, signUpField.invalid ? 'invalid': '']" 
            v-model="signUpField.value" 
            :placeholder="signUpField.label"
            v-on:change="clear(signUpField)" 
          />
        <div v-if="signUpField.key === 'phone_number'" v-bind:class="amplifyUI.selectInput">
          <select v-model="country">
            <option v-for="country in countries" v-bind:key="country.label">{{country.label}}</option>
          </select>
          <input 
            v-bind:class="[amplifyUI.input, signUpField.invalid ? 'invalid': '']" 
            v-model="signUpField.value"
            type="number"
            :placeholder="signUpField.label"
            v-on:change="clear(signUpField)"
          />
        </div>
      </div>
    </div>
    <div v-bind:class="amplifyUI.sectionFooter">
      <span v-bind:class="amplifyUI.sectionFooterPrimaryContent">
        <button v-bind:class="amplifyUI.button" v-on:click="signUp">Create Account</button>
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
import Vue from 'vue';
import Vue2Filters from 'vue2-filters'
import AmplifyEventBus from '../../events/AmplifyEventBus';
import * as AmplifyUI from '@aws-amplify/ui';
import countries from '../../assets/countries';

Vue.use(Vue2Filters)

export default {
  name: 'SignUp',
  props: ['signUpConfig'],
  data () {
    return {
      country: 'USA (+1)',
      countryCode: '1',
      countries,
      amplifyUI: AmplifyUI,
      error: '',
      logger: {},
    }
  },
  computed: {
    options() {
      const defaults = {
        header: 'Sign Up',
        signUpFields: [
          {
            label: 'Username',
            key: 'username',
            required: true,
            type: 'string',
            displayOrder: 1,
          },
          {
            label: 'Password',
            key: 'password',
            required: true,
            type: 'password',
            displayOrder: 2,
          },
          {
            label: 'Email',
            key: 'email',
            required: true,
            type: 'string',
            displayOrder: 3
          },
          {
            label: 'Phone Number',
            key: 'phone_number',
            required: true,
            displayOrder: 4
          }
        ]
      }

      if (this.signUpConfig && this.signUpConfig.signUpFields && this.signUpConfig.signUpFields.length > 0) {
        defaults.signUpFields.forEach((f, i) => {
          const matchKey = this.signUpConfig.signUpFields.findIndex((d) => {
            return d.key === f.key;
          });
          if (matchKey === -1) {
            this.signUpConfig.signUpFields.push(f);
          }
        });
        let counter = this.signUpConfig.signUpFields.filter((f) => {
          return f.displayOrder;
        }).length;

        const unOrdered = this.signUpConfig.signUpFields.filter((f) => {
          return !f.displayOrder;
        }).sort((a, b) => {
          if (a.key < b.key) {
            return -1;
          }
          return 1
        }).forEach((m) => {
          counter++;
          m.displayOrder = counter;
          let index = this.signUpConfig.signUpFields.findIndex(y => y.key === m.key);
          this.signUpConfig.signUpFields[index] = m;
        })
      } else if (this.signUpConfig &&
          this.signUpConfig.signUpFields &&
          (!Array.isArray(this.signUpConfig.signUpFields) || this.signUpConfig.signUpFields.length === 0)
        ) {
        delete this.signUpConfig.signUpFields;
      }

      return Object.assign(defaults, this.signUpConfig || {})
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
    },
  },
  methods: {
    signUp: function() {
      if (!this.validate()) {
        return null;
      }

      let user = {
        attributes: {},
      };

      this.options.signUpFields.forEach((e) => {
        if (e.key === 'username') {
          user.username = e.value
        } else if (e.key === 'password') {
          user.password = e.value
        } else if (e.key === 'phone_number') {
          user.attributes.phone_number = `+${this.countryCode}${e.value}`
        } else {
          user.attributes[e.key] = e.value;
        };
      })

       this.$Amplify.Auth.signUp(user)
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
    validate: function() {
      let allValid = true;
      this.options.signUpFields.map((el) => {
        if (el.required && !el.value) {
          allValid = false;
          Vue.set(el, 'invalid', true);
        }
        return el;
      })
      return allValid;
    },
    signIn: function() {
      AmplifyEventBus.$emit('authState', 'signedOut')
    },
    clear(field) {
      if (field && field.invalid && field.value) {
        Vue.set(field, 'invalid', false)
      }
    },
    setError: function(e) {
      this.error = e.message || e;
      this.logger.error(this.error) 
    },
  }
}
</script>
