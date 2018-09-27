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
  <div> 
   <div v-bind:class="amplifyUI.formField">
      <div v-bind:class="amplifyUI.inputLabel">{{options.msg}}</div>
      <button v-bind:class="amplifyUI.button" v-on:click="signOut">{{options.signOutButton}}</button>
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

export default {
  name: 'SignOut',
  props: ['signOutConfig'],
  data () {
    return {
        error: '',
        show: false,
        amplifyUI: AmplifyUI,
        logger: {},
    }
  },
  computed: {
    options() {
      const defaults = {
        msg: null,
        signOutButton: 'Sign Out'
      }
      return Object.assign(defaults, this.signOutConfig || {})
    }
  },
  async mounted() {
    this.logger = new this.$Amplify.Logger(this.$options.name); 
  },
  methods: {
    signOut: function(event) {
        this.$Amplify.Auth.signOut()
            .then(() => {
              this.logger.info('signout success')
              return AmplifyEventBus.$emit('authState', 'signedOut')
            })
            .catch(e => this.setError(e));
    },
    setError: function(e) {
      this.error = e.message || e;
      this.logger.error(this.error)
    }
  }
}
</script>
