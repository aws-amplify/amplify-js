import { Component, Host, h, Prop, State, Listen, Event, EventEmitter, Element } from '@stencil/core';
import { I18n } from '@aws-amplify/core';
import { Interactions } from '@aws-amplify/interactions';
import { JSXBase } from '@stencil/core/internal';
import { AudioRecorder, visualize } from '../../common/audio-control';
import { ChatResult } from '../../common/types/interactions-types';
import { NO_INTERACTIONS_MODULE_FOUND } from '../../common/constants';
import { Translations } from '../../common/Translations';
import { InteractionsResponse } from '@aws-amplify/interactions';

enum MessageFrom {
  Bot = 'bot',
  User = 'user',
}
interface Message {
  content: string;
  from: MessageFrom;
}
enum ChatState {
  Initial,
  Listening,
  Sending,
  Speaking,
  Error,
}

/**
 * @slot header - title content placed at the top
 */
@Component({
  tag: 'amplify-chatbot',
  styleUrl: 'amplify-chatbot.scss',
  shadow: true,
})
export class AmplifyChatbot {
  /** Name of the bot */
  @Prop() botName: string;
  /** Clear messages when conversation finishes */
  @Prop() clearOnComplete: boolean = false;
  /** Continue listening to users after they send the message */
  @Prop() conversationModeOn: boolean = false;
  /** Greeting message displayed to users */
  @Prop() welcomeMessage: string;
  /** Text placed in the top header */
  @Prop() botTitle: string = Translations.CHATBOT_TITLE;
  /** Whether voice chat is enabled */
  @Prop() voiceEnabled: boolean = false;
  /** Whether text chat is enabled */
  @Prop() textEnabled: boolean = true;
  /** Amount of silence (in ms) to wait for */
  @Prop() silenceTime: number = 1500;
  /** Noise threshold between -1 and 1. Anything below is considered a silence. */
  @Prop() silenceThreshold: number = 0.2;

  /** Messages in current session */
  @State() messages: Message[] = [];
  /** Text input box value  */
  @State() text: string = '';
  /** Current app state */
  @State() chatState: ChatState = ChatState.Initial;
  /** Toast error message */
  @State() errorMessage: string;

  @Element() element: HTMLAmplifyChatbotElement;

  private audioRecorder: AudioRecorder;

  // Occurs when user presses enter in input box
  @Listen('formSubmit')
  submitHandler(_event: CustomEvent) {
    this.sendTextMessage();
  }

  /** Event emitted when conversation is completed */
  @Event() chatCompleted: EventEmitter<ChatResult>;

  /**
   * Lifecycle functions
   */
  componentWillLoad() {
    if (!Interactions || typeof Interactions.onComplete !== 'function') {
      throw new Error(NO_INTERACTIONS_MODULE_FOUND);
    }
    this.validateProps();
  }

  componentDidRender() {
    // scroll to the bottom if necessary
    const body = this.element.shadowRoot.querySelector('.body');
    body.scrollTop = body.scrollHeight;
  }

  private validateProps() {
    if (!this.voiceEnabled && !this.textEnabled) {
      this.setError('Error: Either voice or text must be enabled for the chatbot');
    } else if (!this.botName) {
      this.setError('Error: Bot Name must be provided to ChatBot');
    }

    if (this.welcomeMessage) this.appendToChat(this.welcomeMessage, MessageFrom.Bot);
    // Initialize AudioRecorder if voice is enabled
    if (this.voiceEnabled) {
      this.audioRecorder = new AudioRecorder({
        time: this.silenceTime,
        amplitude: this.silenceThreshold,
      });
      this.audioRecorder.init().catch(err => {
        this.setError(err);
      });
    }

    // Callback function to be called after chat is completed
    const onComplete = (err: string, data: object) => {
      this.chatCompleted.emit({
        data,
        err,
      });
      if (this.clearOnComplete) {
        this.reset();
      }
    };

    try {
      Interactions.onComplete(this.botName, onComplete);
    } catch (err) {
      this.setError(err);
    }
  }

  /**
   * Handlers
   */
  private handleMicButton() {
    if (this.chatState !== ChatState.Initial) return;
    this.chatState = ChatState.Listening;
    this.audioRecorder.startRecording(
      () => this.handleSilence(),
      (data, length) => this.visualizer(data, length),
    );
  }

  private handleSilence() {
    this.chatState = ChatState.Sending;
    this.audioRecorder.stopRecording();
    this.audioRecorder.exportWAV().then(blob => {
      this.sendVoiceMessage(blob);
    });
  }

  private handleTextChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.text = target.value;
  }

  private handleCancelButton() {
    this.audioRecorder.clear();
    this.chatState = ChatState.Initial;
  }

  /**
   * Visualization
   */
  private visualizer(dataArray: Uint8Array, bufferLength: number) {
    const canvas = this.element.shadowRoot.querySelector('canvas');
    visualize(dataArray, bufferLength, canvas);
  }

  /**
   * Interactions helpers
   */
  private async sendTextMessage() {
    if (this.text.length === 0 || this.chatState !== ChatState.Initial) return;
    const text = this.text;
    this.text = '';
    this.appendToChat(text, MessageFrom.User);
    this.chatState = ChatState.Sending;

    let response: InteractionsResponse;
    try {
      response = await Interactions.send(this.botName, text);
    } catch (err) {
      this.setError(err);
    }
    if (response.message) {
      this.appendToChat(response.message, MessageFrom.Bot);
    }
    this.chatState = ChatState.Initial;
  }

  private async sendVoiceMessage(audioInput: Blob) {
    const interactionsMessage = {
      content: audioInput,
      options: {
        messageType: 'voice',
      },
    };

    let response: InteractionsResponse;
    try {
      response = await Interactions.send(this.botName, interactionsMessage);
    } catch (err) {
      this.setError(err);
    }
    this.chatState = ChatState.Speaking;

    if (response.inputTranscript) this.appendToChat(response.inputTranscript, MessageFrom.User);
    this.appendToChat(response.message, MessageFrom.Bot);
    await this.audioRecorder.play(response.audioStream).catch(err => this.setError(err));
    this.chatState = ChatState.Initial;
  }

  private appendToChat(content: string, from: MessageFrom) {
    this.messages = [
      ...this.messages,
      {
        content,
        from,
      },
    ];
  }

  /**
   * State control methods
   */
  private setError(error: string | Error) {
    const message = typeof error === 'string' ? error : error.message;
    this.chatState = ChatState.Error;
    this.errorMessage = message;
  }

  private reset() {
    this.chatState = ChatState.Initial;
    this.text = '';
    this.errorMessage = undefined;
    this.messages = [];
    if (this.welcomeMessage) this.appendToChat(this.welcomeMessage, MessageFrom.Bot);
    this.audioRecorder && this.audioRecorder.clear();
  }

  /**
   * Rendering methods
   */
  private messageJSX = (messages: Message[]) => {
    const messageList = messages.map(message => <div class={`bubble ${message.from}`}>{message.content}</div>);
    if (this.chatState === ChatState.Sending) {
      messageList.push(
        <div class="bubble bot">
          <div class="dot-flashing" />
        </div>,
      );
    }
    return messageList;
  };

  private listeningFooterJSX(): JSXBase.IntrinsicElements[] {
    const visualization = <canvas height="50" />;
    const cancelButton = (
      <amplify-button
        data-test="chatbot-cancel-button"
        handleButtonClick={() => this.handleCancelButton()}
        class="icon-button"
        variant="icon"
        icon="ban"
      />
    );
    return [visualization, cancelButton];
  }

  private footerJSX(): JSXBase.IntrinsicElements[] {
    if (this.chatState === ChatState.Listening) return this.listeningFooterJSX();
    const textInput = (
      <amplify-input
        placeholder={I18n.get(Translations.TEXT_INPUT_PLACEHOLDER)}
        description="text"
        handleInputChange={evt => this.handleTextChange(evt)}
        value={this.text}
        disabled={this.chatState === ChatState.Error}
      />
    );
    const micButton = this.voiceEnabled && (
      <amplify-button
        data-test="chatbot-mic-button"
        handleButtonClick={() => this.handleMicButton()}
        class="icon-button"
        variant="icon"
        icon="microphone"
        disabled={this.chatState === ChatState.Error || this.chatState !== ChatState.Initial}
      />
    );
    const sendButton = this.textEnabled && (
      <amplify-button
        data-test="chatbot-send-button"
        class="icon-button"
        variant="icon"
        icon="send"
        handleButtonClick={() => this.sendTextMessage()}
        disabled={this.chatState === ChatState.Error || this.chatState !== ChatState.Initial}
      />
    );
    return [textInput, micButton, sendButton];
  }

  private errorToast() {
    return (
      this.errorMessage && (
        <amplify-toast
          message={this.errorMessage}
          handleClose={() => {
            this.errorMessage = undefined;
          }}
        />
      )
    );
  }

  render() {
    return (
      <Host>
        <div class="amplify-chatbot">
          <slot name="header">
            <div class="header" data-test="chatbot-header">
              {I18n.get(this.botTitle)}
            </div>
          </slot>
          <div class="body" data-test="chatbot-body">
            {this.messageJSX(this.messages)}
          </div>
          <div class="footer" data-test="chatbot-footer">
            {this.footerJSX()}
          </div>
          {this.errorToast()}
        </div>
      </Host>
    );
  }
}
