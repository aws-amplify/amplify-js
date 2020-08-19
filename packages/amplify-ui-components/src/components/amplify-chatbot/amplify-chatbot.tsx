import { Component, Host, h, Prop, State, Listen, Event, EventEmitter, Element } from '@stencil/core';
import { Interactions } from '@aws-amplify/interactions';
import { JSXBase } from '@stencil/core/internal';
import { AudioRecorder } from '../../common/audio-control/recorder';
import { ChatResult } from '../../common/types/interactions-types';
import { NO_INTERACTIONS_MODULE_FOUND } from '../../common/constants';

type Agent = 'user' | 'bot';
interface Message {
  content: string;
  from: Agent;
}

type AppState = 'initial' | 'listening' | 'sending' | 'speaking' | 'error';

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
  @Prop() botTitle: string = 'ChatBot Lex';
  /** Whether voice chat is enabled */
  @Prop() voiceEnabled: boolean = false;
  /** Whether text chat is enabled */
  @Prop() textEnabled: boolean = true;

  /** Messages in current session */
  @State() messages: Message[] = [];
  /** Text input box value  */
  @State() text: string = '';
  /** Current app state */
  @State() state: AppState = 'initial';
  /** Toast error message */
  @State() error: string;

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
    this.updateProps();
  }

  componentDidRender() {
    // scroll to the bottom of messages if necessary
    const body = this.element.shadowRoot.querySelector('.body');
    body.scrollTop = body.scrollHeight;
  }

  private updateProps() {
    if (!this.voiceEnabled && !this.textEnabled) {
      this.setError('Error: you must enable voice or text for the chatbot');
    } else if (!this.botName) {
      this.setError('Error: Bot Name must be provided to ChatBot');
    }
    this.reset();

    // Initialize AudioRecorder if voice is enabled
    if (this.voiceEnabled) {
      this.audioRecorder = new AudioRecorder({
        time: 1500,
        amplitude: 0.2,
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
    if (this.state !== 'initial') return;
    this.state = 'listening';
    this.audioRecorder.startRecording(() => this.handleSilence());
  }

  private handleSilence() {
    this.state = 'sending';
    this.audioRecorder.stopRecording();
    this.audioRecorder.exportWAV(blob => {
      this.sendVoiceMessage(blob);
    });
  }

  private handleTextChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.text = target.value;
  }

  /**
   * Interactions helpers
   */

  private async sendTextMessage() {
    if (this.text.length === 0 || this.state !== 'initial') return;
    const text = this.text;
    this.text = '';
    this.appendToChat(text, 'user');
    this.state = 'sending';

    const response = await Interactions.send(this.botName, text);
    if (response.message) {
      this.appendToChat(response.message, 'bot');
    }
    this.state = 'initial';
  }

  private async sendVoiceMessage(audioInput: Blob) {
    const interactionsMessage = {
      content: audioInput,
      options: {
        messageType: 'voice',
      },
    };
    const response = await Interactions.send(this.botName, interactionsMessage);
    this.state = 'speaking';
    if (response.inputTranscript) this.appendToChat(response.inputTranscript, 'user');
    this.appendToChat(response.message, 'bot');
    this.audioRecorder.play(response.audioStream, () => {
      this.state = 'initial';
    });
  }

  private appendToChat(content: string, from: Agent) {
    this.messages = [
      ...this.messages,
      {
        content,
        from,
      },
    ];
  }

  /**
   * State control functions
   */

  private setError(message: string) {
    this.state = 'error';
    this.error = message;
  }

  private reset() {
    this.state = 'initial';
    this.text = '';
    this.error = undefined;
    this.messages = [];
    if (this.welcomeMessage) this.appendToChat(this.welcomeMessage, 'bot');
    this.audioRecorder && this.audioRecorder.clear();
  }

  /**
   * Rendering related methods
   */

  private messageJSX = (messages: Message[]) => {
    const messageList = messages.map(message => <div class={`bubble ${message.from}`}>{message.content}</div>);
    if (this.state === 'sending') {
      messageList.push(
        <div class="bubble bot">
          <div class="dot-flashing" />
        </div>,
      );
    }
    return messageList;
  };

  private footerJSX(): JSXBase.IntrinsicElements[] {
    const textInput = (
      <amplify-input
        placeholder="Write a message"
        fieldId="test"
        description="text"
        handleInputChange={evt => this.handleTextChange(evt)}
        value={this.text}
        disabled={this.state === 'error'}
      />
    );
    const micButton = this.voiceEnabled && (
      <amplify-button
        handleButtonClick={() => this.handleMicButton()}
        class="icon-button"
        variant="icon"
        icon="microphone"
        disabled={this.state === 'error' || this.state !== 'initial'}
      />
    );
    const sendButton = this.textEnabled && (
      <amplify-button
        class="icon-button"
        variant="icon"
        icon="send"
        handleButtonClick={() => this.sendTextMessage()}
        disabled={this.state === 'error' || this.state !== 'initial'}
      />
    );
    return [textInput, micButton, sendButton];
  }

  private errorToast() {
    return (
      this.error && (
        <amplify-toast
          message={this.error}
          handleClose={() => {
            this.error = undefined;
          }}
        />
      )
    );
  }

  render() {
    return (
      <Host>
        <div class="amplify-chatbot">
          <div class="header" data-test="chatbot-header">
            {this.botTitle}
          </div>
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
