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
    <div class="amplify-album">
      <div 
        class="amplify-album-container"
      >
        <amplify-s3-image
          class="amplify-image-container"
          v-for="item in items"
          v-bind:key="item.key"
          :imagePath="item.path"
        ></amplify-s3-image>
      </div>
    </div>
    <div class="error" v-if="error">
      {{ error }}
    </div>
  </div>
</template>

<script>
import AmplifyEventBus from '../../events/AmplifyEventBus';

export default {
  name: 'S3Album',
  props: ['path'],
  data () {
    return {
      logger: {},
      error: '',
      items: [],
    }
  },
  mounted() {
    this.logger = new this.$Amplify.Logger(this.$options.name);
    this.getImages();
    AmplifyEventBus.$on('fileUpload', img => {
      this.pushImage(img);
    });
  },
  methods: {
    getImages() {
      if (!this.path) { 
        this.setError('Album path not provided');
        return; 
      }
      const that = this;
      this.$Amplify.Storage.list(this.path)
        .then(res => {
          that.items = res.map(item => {
            return { path: item.key };
          });
        })
        .catch(e => this.setError(e));
    },
    pushImage(img) {
      if (!img) {
        this.setError('Image path not provided');
        return;
      }
      this.items.push({key: 123, path: img});
    },
    setError: function(e) {
      this.error = e.message || e;
      this.logger.error(this.error);
    }

  }
}
</script>
