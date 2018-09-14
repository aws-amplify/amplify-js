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
<div class="amplify-interactions">
	<div class="amplify-interactions-container">
		<div class="amplify-form-container">
			<div class="amplify-form-row">
				<div class="amplify-interactions-conversation">
					<div 
            v-for="message in messages"
            v-bind:key="message.meSentTime"
          >
						<div class="amplify-interactions-input">{{message.me}}</div>
						<div class="amplify-interactions-input-timestamp">{{message.meSentTime}}</div>
						<div class="amplify-interactions-response">{{message.bot}}</div>
						<div class="amplify-interactions-response-timestamp">{{message.botSentTime}}</div>
					</div>
				</div>
			</div>
			<div class="amplify-interactions-actions">
				<input
					type='text'
					class="amplify-form-input"
					placeholder="Write a message"
					v-model="inputText"
					v-on:keyup="keymonitor"
        />

				<button class="amplify-interactions-button" @click="onSubmit(inputText)"></button>
			</div>
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
  name: 'Chatbot',
  props: ['chatbotConfig'],
  data () {
    return {
			inputText: '',
			error: '',
      messages: [],
			logger: {},
    }
  },
  computed: {
    options() {
      const defaults = {
				clearComplete: true,
				botTitle: 'Chatbot'
      }
      return Object.assign(defaults, this.chatbotConfig || {})
    }
  },
  mounted() {
		this.logger = new this.$Amplify.Logger(this.$options.name);
		if (!this.options.bot){
			this.setError('Bot not provided.')
		}
		this.$Amplify.Interactions.onComplete(this.options.bot,this.performOnComplete);
  },
  methods: {
    performOnComplete(evt) {
			AmplifyEventBus.$emit('chatComplete', this.options.botTitle);
      if (this.options.clearComplete) {
        this.messages = [];
      }
    },
    keymonitor(event) {
      if (event.key.toLowerCase() == "enter")
      {
        this.onSubmit(this.inputText);
      }
    },
    onSubmit(e) {
			if (!this.inputText) {
				return;
			}
			let message = {
				'me':this.inputText,
				'meSentTime': new Date().toLocaleTimeString(),
				'bot': '',
				'botSentTime': ''
			};
			this.$Amplify.Interactions.send(this.options.bot, this.inputText)
				.then((response) => {
					this.inputText = "";
					if (response.message){
						message.bot = response.message;
						message.botSentTime = new Date().toLocaleTimeString();
						this.messages.push(message);
					}
				})
				.catch(e => this.setError(e));
		},
		setError: function(e) {
      this.error = e.message || e;
      this.logger.error(this.error);
    }
  }
}
</script>
