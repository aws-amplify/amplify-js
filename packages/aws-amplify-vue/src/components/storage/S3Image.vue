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
    <img
      @click="blowUp(url)"
      class="amplify-image"
      :src="url"
    />
  </div>
</template>

<script>
import AmplifyEventBus from '../../events/AmplifyEventBus';

export default {
  name: 'S3Image',
  props: ['imagePath'],
  data () {
    return {
      url: null,
      error: '',
      logger: {},
    }
  },
  mounted() {
    this.logger = new this.$Amplify.Logger(this.$options.name);
    this.getImage();
  },
  methods: {
    getImage() {
      if (!this.imagePath) {
        return this.setError('Image path not provided.')
      }
      this.$Amplify.Storage
        .get(this.imagePath)
        .then((url) => {
          this.url = url
          })
        .catch(e => this.setError(e));
    },
    blowUp(url) {
      window.open(url);
    },
    setError: function(e) {
      this.error = e.message || e;
      this.logger.error(this.error);
    }
  }
}
</script>
