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
    <template v-if="isMutation">
      <slot :loading="loading" :mutate="mutate" :errors="errors" />
    </template>
    <template v-else>
      <slot :loading="loading" :data="data" :errors="errors" />
    </template>
  </div>  
</template>

<script>

import Vue from 'vue';

export default {
  name: 'Connect',

  props: [
    'query',
    'mutation',
    'subscription',
    'onSubscriptionMsg',
  ],

  data () {
    return {
      logger: {},
      loading: false,
      data: {},
      errors: [],
      watchedSubscription: null,
      isMutation: false,
      internalMutation: null,
    }
  },

  watch: {
    query: function(val) {
      if (!this.loading) {
        this._fetchData();
      }
    },
    mutation: function(val) {
      if (!this.loading) {
        this._fetchData();
      }
    },
  },

  beforeMount() {
    this.logger = new this.$Amplify.Logger('Connect');
    this._fetchData();
  },

  beforeDestroy() {
    this._unsubscribe();
  },

  methods: {
    async mutate() {
      if (!this.isMutation) { return; }

      this.loading = true;
      await this.internalMutation();
      this.loading = false;
    },

    _setDefaultState() {
      this.loading = false;
      this.data = {};
      this.errors = [];
      this.isMutation = false;
      this.internalMutation = () => null;
    },

    async _fetchData() {
      const {
        query: { query = null, variables = {} } = {},
        mutation: { query: mutation = null, variables: mutationVariables = {} } = {},
        subscription,
        onSubscriptionMsg = (prevData) => prevData,
      } = this.$props;

      this._setDefaultState();

      if (!this.$Amplify.API || typeof this.$Amplify.API.graphql !== 'function' || typeof this.$Amplify.API.getGraphqlOperationType !== 'function') {
        throw new Error('No API module found, please ensure @aws-amplify/api is imported');
      }

      const hasValidQuery = query && this.$Amplify.API.getGraphqlOperationType(query) === 'query';
      const hasValidMutation = mutation && this.$Amplify.API.getGraphqlOperationType(mutation) === 'mutation';
      const hasValidSubscription = subscription && subscription.query
          && this.$Amplify.API.getGraphqlOperationType(subscription.query) === 'subscription';

      if (!hasValidQuery && !hasValidMutation && !hasValidSubscription) {
        this.logger.warn('No query, mutation, or subscription was specified');
      }

      if (hasValidQuery) {
        try {
          this.data = {};
          this.loading = true;
          const response = await this.$Amplify.API.graphql({ query, variables });
          this.data = response.data;
        } catch (error) {
          this.logger.warn(error);
          this.errors = error.errors;
          this.$emit('error', error);
        }
      }

      if (hasValidMutation) {
        this.isMutation = true;
        this.internalMutation = async () => {
          this.$Amplify.API.graphql({ query: mutation, variables: mutationVariables }).then((result) => {
            this.$emit('done', result);
            return result;
          })
          .catch((error) => {
            this.logger.warn(error);
            this.errors = error.errors;
            return this.$emit('error', error);
          })
        };
      }

      if (hasValidSubscription) {
        const { query: subscriptionQuery, variables: subscriptionVariables } = subscription;
        try {
          const observable = this.$Amplify.API.graphql({ query: subscriptionQuery, variables: subscriptionVariables });

          this.watchedSubscription = observable.subscribe({
            next: ({ value: { data }}) => {
              const prevData = {
                data: this.data,
                errors: this.errors,
                loading: this.loading,
              };
              this.data = onSubscriptionMsg(prevData, data);
            },
            error: (error) => this.logger.warn(error),
          });
        } catch (error) {
          this.errors = error.errors;
        }
      }

      this.loading = false;
    },

    _unsubscribe() {
      if (this.watchedSubscription) {
        this.watchedSubscription.unsubscribe();
      }
    },
  },
}
</script>
