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

      let signUpFields = this.signUpConfig && this.signUpConfig.signUpFields

      if (signUpFields && (!Array.isArray(signUpFields) || signUpFields.length === 0)) {
        delete this.signUpConfig.signUpFields;
      } else if ((signUpFields && signUpFields.length)){

        // Keep an array of all the explicitly declared field orders
        const declaredDisplayOrders = signUpFields.map(field => field.displayOrder).filter( val => val)

        // Keep an array of all assigned field orders, including the explicitly declared ones
        const displayOrders = [].concat([], declaredDisplayOrders)

        defaults.signUpFields.forEach((defaultField, index) => {

          const matchKey = signUpFields.findIndex(customField => customField.key === defaultField.key);

          // Ensure that a field received through props, with a displayOrder equal to the displayOrder of a default field, is given order precedence
          while (displayOrders.includes(defaultField.displayOrder)){
            defaultField.displayOrder ++
          }

          // If there was no match, push the default field into the props signUpFields array
          if (matchKey === -1) {
            displayOrders.push(defaultField.displayOrder)
            signUpFields.push(defaultField);
          } else {
            // Otherwise use the field received from the props, merged with the default equivalent
            signUpFields[matchKey] = Object.assign(defaultField, signUpFields[matchKey])
          }
        });

        // get rid of the fields that have been given a negative display order
        this.signUpConfig.signUpFields = signUpFields.filter(field => !field.displayOrder || field.displayOrder >= 0)

        // Get the number of signUpFields that have a display order
        let numOfOrderedFields = this.signUpConfig.signUpFields.filter((f) => f.displayOrder).length;

        // Get the fields that don't have a display order...
        this.signUpConfig.signUpFields.filter((f) => !f.displayOrder)

        // ...and order them by key instead...
        .sort((a, b) => a.key < b.key ? -1 : 1)

        // ...and then give them an explicit display order, beginning from the last explicitly ordered field
        .forEach((m) => m.displayOrder = ++numOfOrderedFields)

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
