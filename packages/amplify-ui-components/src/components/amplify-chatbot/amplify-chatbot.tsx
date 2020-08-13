import { Component, Host, h, Prop, State, Listen, Event, EventEmitter } from '@stencil/core';
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

type AppState = 'initial' | 'listening' | 'sending' | 'speaking';

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
  @Prop() botTitle: string;
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

  private audioRecorder: AudioRecorder;
  private audioInput: Blob;

  @Listen('formSubmit')
  submitHandler(_event: CustomEvent) {
    this.sendText();
  }

  /** Event emitted when conversation is completed */
  @Event() chatCompleted: EventEmitter<ChatResult>;

  messageJSX = (messages: Message[]) => {
    return messages.map(message => <div class={`bubble ${message.from}`}>{message.content}</div>);
  };

  handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.text = target.value;
  }

  appendMessage(content: string, from: Agent) {
    this.messages = [
      ...this.messages,
      {
        content,
        from,
      },
    ];
  }

  reset() {
    this.state = 'initial';
    this.text = '';
    this.audioRecorder && this.audioRecorder.clear();
  }

  micButtonHandler() {
    if (this.state !== 'initial') return;
    this.state = 'listening';
    this.audioRecorder.startRecording(() => this.onSilenceHandler());
  }

  onSilenceHandler() {
    this.state = 'sending';
    this.audioRecorder.stopRecording();
    this.audioRecorder.exportWAV(blob => {
      this.audioInput = blob;
      this.lexResponseHandler();
    });
  }

  async lexResponseHandler() {
    this.state = 'speaking';
    if (!Interactions || typeof Interactions.send !== 'function') {
      throw new Error(NO_INTERACTIONS_MODULE_FOUND);
    }
    const interactionsMessage = {
      content: this.audioInput,
      options: {
        messageType: 'voice',
      },
    };
    const response = await Interactions.send(this.botName, interactionsMessage);
    if ((response as any).inputTranscript === '') {
      this.appendMessage('&#10240', 'user');
    } else {
      this.appendMessage((response as any).inputTranscript, 'user');
    }
    this.appendMessage((response as any).message, 'bot');
    this.playTranscript((response as any).audioStream);
  }

  playTranscript(audioStream: Uint8Array) {
    this.audioRecorder.play(audioStream, () => {
      this.state = 'initial';
    });
  }

  async sendText() {
    if (this.text.length === 0 || this.state !== 'initial') return;
    const text = this.text;
    this.text = '';
    this.appendMessage(text, 'user');
    this.state = 'sending';

    const response = await Interactions.send(this.botName, text);
    if (response.message) {
      this.appendMessage(response.message, 'bot');
    }
    this.state = 'initial';
  }

  connectedCallback() {
    if (this.voiceEnabled) {
      this.audioRecorder = new AudioRecorder({
        time: 1500,
        amplitude: 0.2,
      });
      console.log(this.audioRecorder);
    }
  }

  componentWillLoad() {
    if (this.messages.length === 0 && this.welcomeMessage && this.welcomeMessage.length > 0) {
      this.appendMessage(this.welcomeMessage, 'bot');
    }
    if (this.botName) {
      if (!Interactions || typeof Interactions.onComplete !== 'function') {
        throw new Error(NO_INTERACTIONS_MODULE_FOUND);
      }
      const onComplete = (err: string, data: object) => {
        console.log({ err, data });
        this.chatCompleted.emit({
          data,
          err,
        });
        if (this.clearOnComplete) {
          this.messages = [];
        }
      };
      Interactions.onComplete(this.botName, onComplete);
    }
  }

  footerJSX(): JSXBase.IntrinsicElements[] {
    const textInput = (
      <amplify-input
        placeholder="Write a message"
        fieldId="test"
        description="text"
        handleInputChange={evt => this.handleChange(evt)}
        value={this.text}
      />
    );
    const micButton = this.voiceEnabled && (
      <amplify-button
        handleButtonClick={() => this.micButtonHandler()}
        class="icon-button"
        variant="icon"
        icon="microphone"
        disabled={this.state !== 'initial'}
      />
    );
    const sendButton = this.textEnabled && (
      <amplify-button
        class="icon-button"
        variant="icon"
        icon="send"
        handleButtonClick={() => this.sendText()}
        disabled={this.state !== 'initial'}
      />
    );
    return [textInput, micButton, sendButton];
  }

  render() {
    console.log(this.state);
    return (
      <Host>
        <div class="amplify-chatbot">
          <div class="header">{this.botTitle}</div>
          <div class="body">{this.messageJSX(this.messages)}</div>
          <div class="chatbot-control">{this.footerJSX()}</div>
        </div>
      </Host>
    );
  }
}
