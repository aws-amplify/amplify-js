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
  <div v-bind:data-test="auth.signOut.section">
   <div v-bind:class="amplifyUI.formField">
      <div v-bind:class="amplifyUI.inputLabel">{{options.msg}}</div>
      <button v-bind:class="amplifyUI.button" v-on:click="signOut" v-bind:data-test="auth.signOut.button">{{options.signOutButton}}</button>
    </div>
    <div class="error" v-if="error">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import * as AmplifyUI from '@aws-amplify/ui';
import BaseComponent, { PropType } from '../base';
import AmplifyEventBus from '../../events/AmplifyEventBus';
import { existsSync } from 'fs';
import { auth } from '../../assets/data-test-attributes';

interface ISignOutConfig {
  msg: any;
  signOutButton: string;
}

export default BaseComponent.extend({
  name: 'SignOut',
  props: {
    signOutConfig: {} as PropType<ISignOutConfig>,
  },
  data() {
    return {
      show: false,
      amplifyUI: AmplifyUI,
      auth,
    };
  },
  computed: {
    options(): ISignOutConfig {
      const defaults = {
        msg: null,
        signOutButton: this.I18n.get('Sign Out'),
      };
      return Object.assign(defaults, this.signOutConfig || {});
    },
  },
  methods: {
    async signOut(event) {
      try {
        await this.Auth.signOut();
        this.logger.info('signout success');
        AmplifyEventBus.$emit('authState', 'signedOut');
      } catch (e) {
        this.setError(e);
      }
    },
  },
});
</script>
