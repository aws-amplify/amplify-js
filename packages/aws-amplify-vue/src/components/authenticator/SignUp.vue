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
          :signUpField="signUpField.key"
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
        <button v-bind:class="amplifyUI.button" v-on:click="signUp">{{$Amplify.I18n.get('Create account')}}</button>
      </span>
      <span v-bind:class="amplifyUI.sectionFooterSecondaryContent">
        {{$Amplify.I18n.get('Have an account? ')}}
        <a v-bind:class="amplifyUI.a" v-on:click="signIn">{{$Amplify.I18n.get('Sign In')}}</a>
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
        header: this.$Amplify.I18n.get('Sign Up Account'),
        signUpFields: [
          {
            label: this.$Amplify.I18n.get('Username'),
            key: 'username',
            required: true,
            type: 'text',
            displayOrder: 1,
          },
          {
            label: this.$Amplify.I18n.get('Password'),
            key: 'password',
            required: true,
            type: 'password',
            displayOrder: 2,
          },
          {
            label: this.$Amplify.I18n.get('Email'),
            key: 'email',
            required: true,
            type: 'text',
            displayOrder: 3
          },
          {
            label: this.$Amplify.I18n.get('Phone Number'),
            key: 'phone_number',
            required: true,
            displayOrder: 4
          }
        ]
      }

      // sets value in country code dropdown if defaultCountryCode value is present in props 
      if (this.signUpConfig && this.signUpConfig.defaultCountryCode) {
        this.country = this.countries.find(c => c.value === this.signUpConfig.defaultCountryCode).label;
      };

      if (this.signUpConfig && this.signUpConfig.hiddenDefaults && this.signUpConfig.hiddenDefaults.length > 0){
        defaults.signUpFields = defaults.signUpFields.filter((d) => {
          return !this.signUpConfig.hiddenDefaults.includes(d.key);
        });
      }

      // begin looping through signUpFields
      if (this.signUpConfig && this.signUpConfig.signUpFields && this.signUpConfig.signUpFields.length > 0) {
        // if hideDefaults is not present on props...
        if (!this.signUpConfig.hideDefaults) {
          // ...add default fields to signUpField array unless user has passed in custom field with matching key
          defaults.signUpFields.forEach((f, i) => {
            const matchKey = this.signUpConfig.signUpFields.findIndex((d) => {
              return d.key === f.key;
            });
            if (matchKey === -1) {
              this.signUpConfig.signUpFields.push(f);
            }
          });
        }
        /* 
          sort fields based on following rules:
          1. Fields with displayOrder are sorted before those without displayOrder
          2. Fields with conflicting displayOrder are sorted alphabetically by key
          3. Fields without displayOrder are sorted alphabetically by key
        */
        this.signUpConfig.signUpFields.sort((a, b) => {
          if (a.displayOrder && b.displayOrder) {
            if (a.displayOrder < b.displayOrder) {
              return -1;
            } else if (a.displayOrder > b.displayOrder) {
              return 1;
            } else {
              if (a.key < b.key) {
                return -1;
              } else {
                return 1;
              }
            }
          } else if (!a.displayOrder && b.displayOrder) {
            return -1;
          } else if (a.displayOrder && !b.displayOrder) {
            return 1;
          } else if (!a.displayOrder && !b.displayOrder) {
            if (a.key < b.key) {
              return 1;
            } else {
              return -1;
            }
          }
        });
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

      // puts field data into 'Auth.signUp' parameter structure
      this.options.signUpFields.forEach((e) => {
        if (e.key === 'username') {
          user.username = e.value
        } else if (e.key === 'password') {
          user.password = e.value
        } else if (e.key === 'phone_number' && e.value) {
          user.attributes.phone_number = `+${this.countryCode}${e.value}`
        } else {
          const newKey = `${this.needPrefix(e.key) ? 'custom:' : ''}${e.key}`;
          user.attributes[newKey] = e.value;
        };
      })

       this.$Amplify.Auth.signUp(user)
            .then(data => {
              this.logger.info('sign up success');
              AmplifyEventBus.$emit('localUser', data.user)
              if (data.userConfirmed === false){
                return AmplifyEventBus.$emit('authState', 'confirmSignUp');
              }
              return AmplifyEventBus.$emit('authState', 'signIn')
            })
            .catch(e => this.setError(e));

    },
    validate: function() {
      let invalids = [];
      this.options.signUpFields.map((el) => {
        if (el.required && !el.value) {
          invalids.push(el.label);
          Vue.set(el, 'invalid', true);
        }
        return el;
      })
      if (invalids.length > 0) {
        this.setError(`The following fields must be completed: ${invalids.join(', ')}`)
      }
      return invalids.length < 1;
    },
    signIn: function() {
      AmplifyEventBus.$emit('authState', 'signIn')
    },
    clear(field) {
      if (field && field.invalid && field.value) {
        Vue.set(field, 'invalid', false)
      }
    },
    setError: function(e) {
      this.error = this.$Amplify.I18n.get(e.message || e);
      this.logger.error(this.error)
    },

    // determines whether or not key needs to be prepended with 'custom:' for Cognito User Pool custom attributes.
    needPrefix: function(key) {
      const field = this.options.signUpFields.find(e => e.key === key);
      if (key.indexOf('custom:') !== 0) {
        return field.custom ;
      } else if (key.indexOf('custom:') === 0 && field.custom === false) {
          this.logger.warn('Custom prefix prepended to key but custom field flag is set to false');
      }
      return null;
    },
  }
}
</script>
