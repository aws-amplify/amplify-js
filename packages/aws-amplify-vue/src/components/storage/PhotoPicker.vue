<template>
  <div v-bind:class="amplifyUI.formSection" style="width: 380px">
    <div v-bind:class="amplifyUI.sectionHeader">{{options.header}}</div>
    <div v-bind:class="amplifyUI.sectionBody">
      <img
        v-if="file"
        :src="photoUrl"
        style="max-width: 100%"
      />
      <div v-bind:class="amplifyUI.photoPlaceholder"  v-if="!file">
        <div v-bind:class="amplifyUI.photoPlaceholderIcon" v-if="!file">
          <svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24'>
            <circle cx='12' cy='12' r='3.2' />
            <path d='M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z'/>
            <path d='M0 0h24v24H0z' fill='none' />
            </svg>
        </div>
      </div>
      <input
        ref="file_input"
        type="file"
        :accept="options.accept"
        @change="pick"
      />
    </div>
    <button v-if="file" v-bind:class="[amplifyUI.photoPickerButton, amplifyUI.button]" v-on:click="upload" :disabled="!file">{{options.title}}</button>
    <div class="error" v-if="error">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import * as AmplifyUI from '@aws-amplify/ui';
import BaseComponent, { PropType } from '../base';
import AmplifyEventBus from '../../events/AmplifyEventBus';

interface IPhotoPickerConfig {
  header: string;
  title: string;
  accept: string;
  storageOptions?: {
    contentType?: string;
  };
  path?: string;
  defaultName?: string;
}

export default BaseComponent.extend({
  name: 'PhotoPicker',
  props: {
    photoPickerConfig: {} as PropType<IPhotoPickerConfig>,
  },
  data() {
    return {
      file: null,
      s3ImagePath: '',
      photoUrl: '',
      amplifyUI: AmplifyUI,
    };
  },
  computed: {
    options(): IPhotoPickerConfig {
      const defaults = {
        header: this.I18n.get('File Upload'),
        title: this.I18n.get('Upload'),
        accept: '*/*',
        storageOptions: {},
      };
      return Object.assign(defaults, this.photoPickerConfig || {});
    },
  },
  mounted() {
    if (!this.options.path) {
      return this.setError('File path not provided.');
    }
    if (this.options.path.substr(this.options.path.length - 1) !== '/') {
      this.options.path = this.options.path + '/';
    }
  },
  methods: {
    async upload() {
      try {
        const result = await this.$Amplify.Storage.put(
          this.s3ImagePath,
          this.file,
          this.options.storageOptions
        );
        this.completeFileUpload(result.key);
      } catch (e) {
        this.setError(e);
      }
    },
    pick(evt: Event) {
      const target = evt.target as HTMLInputElement;
      this.file = target.files[0];
      if (!this.file) {
        return;
      }
      if (!this.options.storageOptions.contentType) {
        this.options.storageOptions.contentType = this.file.type;
      }

      const name = this.options.defaultName
        ? this.options.defaultName
        : this.file.name;
      this.s3ImagePath = `${this.options.path}${name}`;
      const reader = new FileReader();
      reader.onload = e => {
        this.photoUrl = e.target.result as string;
      };
      reader.readAsDataURL(this.file);
    },
    completeFileUpload(imgUrl: string) {
      this.file = null;
      this.s3ImagePath = null;
      (this.$refs.file_input as HTMLInputElement).value = null;
      AmplifyEventBus.$emit('fileUpload', imgUrl);
    },
  },
});
</script>
