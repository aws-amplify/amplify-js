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

<script lang="ts">
import BaseComponent, { PropType } from '../base';
import AmplifyEventBus from '../../events/AmplifyEventBus';

export interface IS3ImageConfig {
  level?: 'private' | 'protected' | 'public';
  download?: boolean;
  expires?: number;
  track?: boolean;
}

export default BaseComponent.extend({
  name: 'S3Image',
  props: {
    s3ImageConfig: {} as PropType<IS3ImageConfig>,
    imagePath: String as PropType<string>,
  },
  data() {
    return {
      url: null,
    };
  },
  computed: {
    options(): IS3ImageConfig {
      // retain for future use
      const defaults = {};
      return Object.assign(defaults, this.s3ImageConfig || {});
    }
  },
  mounted() {
    this.getImage();
  },
  methods: {
    async getImage() {
      if (!this.imagePath) {
        this.setError('Image path not provided.');
        return;
      }
      try {
        this.url = await this.$Amplify.Storage.get(
          this.imagePath,
          this.options
        );
      } catch (e) {
        this.setError(e);
      }
    },
    blowUp(url: string) {
      window.open(url);
    }
  }
});
</script>

<style scoped>
.amplify-image {
  width: 30%;
  margin: 0.2em;
  border-radius: 6px;
  border: 2px solid var(--color-white);
  cursor: pointer;
}
</style>
