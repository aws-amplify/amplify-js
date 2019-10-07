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

import { APIClass } from '@aws-amplify/api';
import { AuthClass } from '@aws-amplify/auth';
import Amplify, { Logger, I18n } from '@aws-amplify/core';
import Vue from 'vue';

type I18nClass = typeof I18n;
let _api = null as APIClass;

export default Vue.extend({
  name: 'BaseComponent',

  data() {
    return {
      $Amplify: null as typeof Amplify,
      error: '',
      logger: null as Logger,
    };
  },

  beforeMount() {
    this.logger = new this.$Amplify.Logger(this.$options.name) as Logger;
  },

  computed: {
    API(): APIClass {
      if (_api) {
        return _api;
      }

      const api = this.$Amplify.API;
      if (!api) {
        throw new Error(
          'No API module found, please ensure @aws-amplify/api is imported'
        );
      }
      _api = api;
      return api as APIClass;
    },
    Auth(): AuthClass {
      return this.$Amplify.Auth as AuthClass;
    },
    I18n(): I18nClass {
      return this.$Amplify.I18n as I18nClass;
    },
    options(): any {
      throw new Error('This class does not have any options');
    },
  },

  methods: {
    setError(e: any) {
      this.error = this.I18n.get(e.message || e);
      this.logger.error(this.error);
    },
  },
});

export { PropType } from 'vue';
