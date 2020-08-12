import { Component, Host, h, Prop, State, Listen } from '@stencil/core';
import { Interactions } from '@aws-amplify/interactions';
import { JSXBase } from '@stencil/core/internal';

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
  /** Callback to be called after conversation finishes */
  @Prop() onComplete: (err: string, data: object) => void;
  /** Text placed in the top header */
  @Prop() botTitle: string;
  /** Whether voice chat is enabled */
  @Prop() voiceEnabled: boolean = false;
  /** Whether text chat is enabled */
  @Prop() textEnabled: boolean = true;

  /** Messages in current session */
  @State() messages: Message[] = [];
  /** Value of the text  */
  @State() text: string = '';
  @State() state: AppState = 'initial';

  @Listen('formSubmit')
  submitHandler(_event: CustomEvent) {
    this.sendText();
  }

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

  async sendText() {
    if (this.text.length === 0 || this.state !== 'initial') return;

    const text = this.text;
    this.text = '';
    this.appendMessage(text, 'user');
    this.state = 'sending';

    const response = await Interactions.send(this.botName, text);
    this.appendMessage(response.message, 'bot');
    this.state = 'initial';
  }

  async componentWillLoad() {
    // TODO: check if interactions is avaialable
    if (this.messages.length === 0 && this.welcomeMessage && this.welcomeMessage.length > 0) {
      this.messages.push({
        content: this.welcomeMessage,
        from: 'bot',
      });
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
    const micButton = (
      <amplify-button class="icon-button" variant="icon" icon="microphone" disabled={this.state !== 'initial'} />
    );
    const sendButton = (
      <amplify-button
        class="icon-button"
        variant="icon"
        icon="send"
        handleButtonClick={() => this.sendText()}
        disabled={this.state !== 'initial'}
      />
    );
    // TODO: clever way to handle this logic?
    console.log(this.voiceEnabled && this.textEnabled);
    if (this.voiceEnabled && this.textEnabled) {
      return [textInput, micButton, sendButton];
    } else if (this.voiceEnabled) {
      return [textInput, micButton];
    } else if (this.textEnabled) {
      return [textInput, sendButton];
    } else {
      // TODO: throw an warning that at least one should be enabled.
      return [textInput, sendButton];
    }
  }

  render() {
    console.log(this.voiceEnabled);
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
