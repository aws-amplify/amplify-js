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
    this.updateProps();
  }

  componentDidRender() {
    // scroll to the bottom of messages if necessary
    const body = this.element.shadowRoot.querySelector('.body');
    body.scrollTop = body.scrollHeight;
  }

  private updateProps() {
    if (!this.voiceEnabled && !this.textEnabled) {
      this.setError('Error: Either voice or text must be enabled for the chatbot');
    } else if (!this.botName) {
      this.setError('Error: Bot Name must be provided to ChatBot');
    }

    if (this.welcomeMessage) this.appendToChat(this.welcomeMessage, 'bot');
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
    this.audioRecorder.startRecording(
      () => this.handleSilence(),
      (data, length) => this.visualizer(data, length),
    );
  }

  private handleSilence() {
    this.state = 'sending';
    this.audioRecorder.stopRecording();
    this.audioRecorder.exportWAV((blob: Blob) => {
      this.sendVoiceMessage(blob);
    });
  }

  private handleTextChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.text = target.value;
  }

  private cancelButtonHandler() {
    this.state = 'initial';
    this.audioRecorder.stopRecording();
  }

  /**
   * Visualization
   */
  private visualizer(dataArray: Uint8Array, bufferLength: number) {
    const canvas = this.element.shadowRoot.querySelector('canvas');
    if (!canvas) return;
    const { width, height } = canvas.getBoundingClientRect();

    // need to update the default canvas width and height
    canvas.width = width;
    canvas.height = height;

    const canvasCtx = canvas.getContext('2d');
    let animationId: number;

    canvasCtx.fillStyle = 'white';
    canvasCtx.clearRect(0, 0, width, height);

    const draw = () => {
      if (this.state !== 'listening') return;

      canvasCtx.fillRect(0, 0, width, height);
      canvasCtx.lineWidth = 1;
      canvasCtx.strokeStyle = '#099ac8';
      canvasCtx.beginPath();

      const sliceWidth = (width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] / 128.0;
        const y = (value * height) / 2;
        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    // Register our draw function with requestAnimationFrame.
    if (!animationId) {
      animationId = requestAnimationFrame(draw);
    }
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
    this.errorMessage = message;
  }

  private reset() {
    this.state = 'initial';
    this.text = '';
    this.errorMessage = undefined;
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

  private listeningFooterJSX(): JSXBase.IntrinsicElements[] {
    const visualization = <canvas height="50" />;
    const cancelButton = this.state === 'listening' && (
      <amplify-button
        data-test="chatbot-cancel-button"
        handleButtonClick={() => this.cancelButtonHandler()}
        class="icon-button"
        variant="icon"
        icon="ban"
      />
    );
    return [visualization, cancelButton];
  }

  private footerJSX(): JSXBase.IntrinsicElements[] {
    if (this.state === 'listening') return this.listeningFooterJSX();
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
        data-test="chatbot-mic-button"
        handleButtonClick={() => this.handleMicButton()}
        class="icon-button"
        variant="icon"
        icon="microphone"
        disabled={this.state === 'error' || this.state !== 'initial'}
      />
    );
    const sendButton = this.textEnabled && (
      <amplify-button
        data-test="chatbot-send-button"
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
              {this.botTitle}
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
