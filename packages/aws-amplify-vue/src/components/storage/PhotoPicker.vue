<template>
	<div v-bind:class="amplifyUI.formSection" style="width: 380px">
		<div v-bind:class="amplifyUI.sectionHeader">{{ options.header }}</div>
		<div v-bind:class="amplifyUI.sectionBody">
			<img v-if="file" :src="photoUrl" style="max-width: 100%" />
			<div v-bind:class="amplifyUI.photoPlaceholder" v-if="!file">
				<div v-bind:class="amplifyUI.photoPlaceholderIcon" v-if="!file">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="64"
						height="64"
						viewBox="0 0 24 24"
					>
						<circle cx="12" cy="12" r="3.2" />
						<path
							d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
						/>
						<path d="M0 0h24v24H0z" fill="none" />
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
		<button
			v-if="file"
			v-bind:class="[amplifyUI.photoPickerButton, amplifyUI.button]"
			v-on:click="upload"
			:disabled="!file"
		>
			{{ options.title }}
		</button>
		<div class="error" v-if="error">
			{{ error }}
		</div>
	</div>
</template>

<script>
import * as AmplifyUI from '@aws-amplify/ui';
import AmplifyEventBus from '../../events/AmplifyEventBus';

export default {
	name: 'PhotoPicker',
	props: ['photoPickerConfig'],
	data() {
		return {
			logger: {},
			file: null,
			s3ImagePath: '',
			photoUrl: '',
			error: '',
			amplifyUI: AmplifyUI,
		};
	},
	computed: {
		options() {
			const defaults = {
				header: this.$Amplify.I18n.get('File Upload'),
				title: this.$Amplify.I18n.get('Upload'),
				accept: '*/*',
				storageOptions: {},
			};
			return Object.assign(defaults, this.photoPickerConfig || {});
		},
	},
	mounted() {
		this.logger = new this.$Amplify.Logger(this.$options.name);
		if (!this.options.path) {
			return this.setError('File path not provided.');
		}
		if (this.options.path.substr(this.options.path.length - 1) !== '/') {
			this.options.path = this.options.path + '/';
		}
	},
	methods: {
		upload: function () {
			this.$Amplify.Storage.put(
				this.s3ImagePath,
				this.file,
				this.options.storageOptions
			)
				.then((result) => {
					this.completeFileUpload(result.key);
				})
				.catch((e) => this.setError(e));
		},
		pick: function (evt) {
			this.file = evt.target.files[0];
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
			const that = this;
			const reader = new FileReader();
			reader.onload = (e) => {
				const target = e.target;
				const url = target.result;
				that.photoUrl = url;
			};
			reader.readAsDataURL(this.file);
		},
		completeFileUpload: function (img) {
			this.file = null;
			this.s3ImageFile = null;
			this.$refs.file_input.value = null;
			AmplifyEventBus.$emit('fileUpload', img);
		},
		setError: function (e) {
			this.error = this.$Amplify.I18n.get(e.message || e);
			this.logger.error(this.error);
		},
	},
};
</script>
