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
            <div v-for="message in messages" v-bind:key="message.meSentTime">
              <div class="amplify-interactions-input">{{message.me}}</div>
              <div class="amplify-interactions-input-timestamp">{{message.meSentTime}}</div>
              <div class="amplify-interactions-response">{{message.bot}}</div>
              <div class="amplify-interactions-response-timestamp">{{message.botSentTime}}</div>
            </div>
          </div>
        </div>
        <div class="amplify-interactions-actions">
          <input
            type="text"
            class="amplify-form-input"
            :placeholder="currentVoiceState"
            v-model="inputText"
            v-on:keyup="keymonitor"
            :disabled="inputDisabled"
            v-if="options.textEnabled"
          >
          <input
            type="text"
            class="amplify-form-input"
            :placeholder="currentVoiceState"
            :disabled="!options.textEnabled"
            v-if="!options.textEnabled"
          >
          <button
            :disabled="micButtonDisabled"
            v-if="options.voiceEnabled"
            class="amplify-mic-button"
            @click="micButtonHandler()"
          >{{this.micText}}</button>
          <button
            id="interactions-submit-button"
            v-if="options.textEnabled"
            class="amplify-interactions-button"
            @click="onSubmit(inputText)"
            :disabled="inputDisabled"
          ></button>
        </div>
      </div>
    </div>
    <div class="error" v-if="error">{{ error }}</div>
  </div>
</template>

<script>
import AmplifyEventBus from "../../events/AmplifyEventBus";

let audioControl;

const STATES = {
  INITIAL: { MESSAGE: "Type your message or click  🎤", ICON: "🎤" },
  LISTENING: { MESSAGE: "Listening... click 🔴 again to cancel", ICON: "🔴" },
  SENDING: { MESSAGE: "Please wait...", ICON: "🔊" },
  SPEAKING: { MESSAGE: "Speaking...", ICON: "..." }
};
const defaultVoiceConfig = {
  silenceDetectionConfig: {
    time: 2000,
    amplitude: 0.2
  }
};

export default {
  name: "Chatbot",
  props: ["chatbotConfig"],
  STATES: STATES,
  defaultVoiceConfig: defaultVoiceConfig,
  audioControl: audioControl,
  data() {
    return {
      inputText: "",
      error: "",
      messages: [],
      logger: {},
      currentVoiceState: STATES.INITIAL.MESSAGE,
      inputDisabled: false,
      micText: STATES.INITIAL.ICON,
      continueConversation: false,
      micButtonDisabled: false
    };
  },
  computed: {
    options() {
      const defaults = {
        clearComplete: true,
        botTitle: "Chatbot",
        conversationModeOn: false,
        voiceConfig: defaultVoiceConfig,
        voiceEnabled: false,
        textEnabled: true
      };
      return Object.assign(defaults, this.chatbotConfig || {});
    }
  },
  mounted() {
    this.logger = new this.$Amplify.Logger(this.$options.name);
    if (!this.options.bot) {
      this.setError("Bot not provided.");
    }
    if (this.options.voiceEnabled) {
      require("./aws-lex-audio.js");
      audioControl = new global.LexAudio.audioControl();
    }
    if (!this.options.textEnabled && this.options.voiceEnabled) {
      STATES.INITIAL.MESSAGE = "Click the mic button";
      this.currentVoiceState = STATES.INITIAL.MESSAGE;
    }
    if (this.options.textEnabled && !this.options.voiceEnabled) {
      STATES.INITIAL.MESSAGE = "Type a message";
      this.currentVoiceState = STATES.INITIAL.MESSAGE;
    }

    this.$Amplify.Interactions.onComplete(
      this.options.bot,
      this.performOnComplete
    );
  },
  methods: {
    performOnComplete(evt) {
      AmplifyEventBus.$emit("chatComplete", this.options.botTitle);
      if (this.options.clearComplete) {
        this.messages = [];
      }
    },
    keymonitor(event) {
      if (event.key.toLowerCase() == "enter") {
        this.onSubmit(this.inputText);
      }
    },
    onSubmit(e) {
      if (!this.inputText) {
        return;
      }
      let message = {
        me: this.inputText,
        meSentTime: new Date().toLocaleTimeString(),
        bot: "",
        botSentTime: ""
      };
      this.$Amplify.Interactions.send(this.options.bot, this.inputText)
        .then(response => {
          AmplifyEventBus.$emit("chatResponse", response);
          this.inputText = "";
          if (response.message) {
            message.bot = response.message;
            message.botSentTime = new Date().toLocaleTimeString();
            this.messages.push(message);
          }
        })
        .catch(e => this.setError(e));
    },
    setError: function(e) {
      this.error = this.$Amplify.I18n.get(e.message || e);
      this.logger.error(this.error);
    },
    async micButtonHandler() {
      if (this.continueConversation) {
        this.reset();
      } else {
        this.inputDisabled = true;
        this.continueConversation = true;
        this.currentVoiceState = STATES.LISTENING.MESSAGE;
        this.micText = STATES.LISTENING.ICON;
        this.micButtonDisabled = false;
        audioControl.startRecording(
          this.onSilenceHandler,
          null,
          this.options.voiceConfig.silenceDetectionConfig
        );
      }
    },
    onSilenceHandler() {
      audioControl.stopRecording();
      if (!this.continueConversation) {
        return;
      }

      audioControl.exportWAV(blob => {
        this.currentVoiceState = STATES.SENDING.MESSAGE;
        this.audioInput = blob;
        this.micText = STATES.SENDING.ICON;
        this.micButtonDisabled = true;
        this.lexResponseHandler();
      });
    },
    async lexResponseHandler() {
      if (!this.continueConversation) {
        return;
      }

      const interactionsMessage = {
        content: this.audioInput,
        options: {
          messageType: "voice"
        }
      };

      const response = await this.$Amplify.Interactions.send(
        this.options.bot,
        interactionsMessage
      );

      this.lexResponse = response;
      this.currentVoiceState = STATES.SPEAKING.MESSAGE;
      this.micText = STATES.SPEAKING.ICON;
      this.micButtonDisabled = true;

      let message = {
        me: this.lexResponse.inputTranscript,
        meSentTime: new Date().toLocaleTimeString(),
        bot: "",
        botSentTime: ""
      };

      this.inputText = "";
      if (response.message) {
        message.bot = response.message;
        message.botSentTime = new Date().toLocaleTimeString();
        this.messages.push(message);
      }

      this.inputText = "";

      this.doneSpeakingHandler();
    },
    doneSpeakingHandler() {
      if (!this.continueConversation) {
        return;
      }
      if (this.lexResponse.contentType === "audio/mpeg") {
        audioControl.play(this.lexResponse.audioStream, () => {
          if (
            this.lexResponse.dialogState === "ReadyForFulfillment" ||
            this.lexResponse.dialogState === "Fulfilled" ||
            this.lexResponse.dialogState === "Failed" ||
            !this.options.conversationModeOn
          ) {
            this.inputDisabled = false;
            this.currentVoiceState = STATES.INITIAL.MESSAGE;
            this.micText = STATES.INITIAL.ICON;
            this.micButtonDisabled = false;
            this.continueConversation = false;
          } else {
            this.currentVoiceState = STATES.LISTENING.MESSAGE;
            this.micText = STATES.LISTENING.ICON;
            this.micButtonDisabled = false;
            audioControl.startRecording(
              this.onSilenceHandler,
              null,
              this.options.voiceConfig.silenceDetectionConfig
            );
          }
        });
      } else {
        this.inputDisabled = false;
        this.currentVoiceState = STATES.INITIAL.MESSAGE;
        this.micText = STATES.INITIAL.ICON;
        this.micButtonDisabled = false;
        this.continueConversation = false;
      }
    },
    reset() {
      audioControl.clear();
      this.inputText = "";
      this.currentVoiceState = STATES.INITIAL.MESSAGE;
      this.inputDisabled = false;
      this.micText = STATES.INITIAL.ICON;
      this.continueConversation = false;
      this.micButtonDisabled = false;
    }
  }
};
</script>

<style scoped>
.amplify-interactions {
  width: var(--component-width-desktop);
  margin: 1em auto;
  border-radius: 6px;
  background-color: var(--color-white);
  box-shadow: var(--box-shadow);
}

.amplify-interactions-container {
  width: 400px;
  margin: 0 auto;
  padding: 1em;
}

.amplify-interactions-button {
  background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAApCAYAAABHomvIAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAG2SURBVFiF7dfPKwRhHMfx9+xqhaItIg5KikgOlER2TzhQ4i+QwtndQe4O4uhCSQ57sC6SkotfR1uK2nWgrGJr8yvsjsO2bWtb+8w+88zOYT6nmWfmeebV95lfj6bruo6N4yo1oFAcoGwcoGwcoGwcoGxsDyyz5CqxawhtwPsTNA1C5wxobqGumvJv8d0+HM5B4jvT1jICw1tC3dVO8ds9VNaD25PdHj6A6LnQEOqAkSBs90HsBsZ2wVOVfTweFhpGDTAShMPZ1LQeL+QiNQ1qu0sETOOSidS+ruciu6bB2yE0nLkPyV9c1pU08K9AQx9Ut4AmVhvzKvgfDlKVfDyFmlZhHJgFLIQDaJ+CoVXDQ8sDRXG+dUOVS0cOqBgHMkARXJscDooFiuL8cjgoBmghDoy+B+MR2BmA5I8lODBSQT0JiU/oX8x/jsk4MAJ8CcHeBDQNwcCSJTgwAoxewkcMgpO5SEU4MHIPHs3DbSC1XeGF8QA8nMDzFfjWlODAyC9/9Cyz/fUKF8swvAkuT/4+JkQc2DwKVY3Q0At1PeAuV8jKRP2aRDK2X3Y6QNk4QNk4QNnYHvgLzPueuQw6nCEAAAAASUVORK5CYII=")
    center no-repeat var(--color-white);
  border: none;
  cursor: pointer;
  width: 32px;
}

.amplify-mic-button {
  border: none;
  cursor: pointer;
  width: 32px;
}

.amplify-form-input {
  width: 100%;
}

.amplify-interactions-actions {
  display: flex;
  border-top: var(--input-border);
  margin-bottom: -1em;
  margin-left: -1.9em;
  margin-right: -1.9em;
}

.amplify-interactions-actions > input[type="text"] {
  border: none;
  margin-top: 0px;
  margin-bottom: 0px;
  margin-left: 0px;
}

.amplify-interactions-actions > input[type="text"]:focus {
  border: 0px solid var(--color-white) !important;
}

.amplify-interactions-conversation {
  margin: 1em;
}

.amplify-interactions-input {
  padding: 1em;
  margin: 1em;
  width: 75%;
  margin-left: 5em;
  border-radius: 20px 20px 0 20px;
  background-color: #009ecf;
  box-shadow: 1px 2px 4px 0 rgba(0, 0, 0, 0.1);
  color: var(--color-white);
  font-size: 13px;
  line-height: 16px;
}

.amplify-interactions-input-timestamp {
  color: #828282;
  font-size: 10px;
  letter-spacing: 0.5px;
  line-height: 16px;
  text-align: right;
}

.amplify-interactions-response-timestamp {
  color: #828282;
  font-size: 10px;
  letter-spacing: 0.5px;
  line-height: 16px;
  margin-left: 1.5em;
}

.amplify-interactions-response {
  padding: 1em;
  margin: 1em;
  width: 75%;
  border-radius: 20px 20px 20px 0;
  background-color: #dbdbdb;
  box-shadow: 1px 2px 4px 0 rgba(0, 0, 0, 0.1);
  font-size: 13px;
  line-height: 16px;
  color: #4a4a4a;
}

@media (min-width: 320px) and (max-width: 480px) {
  .amplify-interactions {
    width: var(--component-width-mobile);
  }
  .amplify-interactions-container {
    width: 85%;
  }
}
</style>
