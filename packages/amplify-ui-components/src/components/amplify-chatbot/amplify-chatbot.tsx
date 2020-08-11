import { Component, Host, h, Prop, State, Listen } from '@stencil/core';

interface Message {
  content: string;
  from: 'user' | 'bot';
}

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

  @State() messages: Message[] = [];
  @State() text: string = '';

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

  sendText() {
    if (this.text === '') return;
    this.messages = [
      ...this.messages,
      {
        content: this.text,
        from: 'user',
      },
      {
        content: 'echo: ' + this.text,
        from: 'bot',
      },
    ];
    this.text = '';
  }

  render() {
    return (
      <Host>
        <div class="amplify-chatbot">
          <div class="header">{this.botTitle}</div>
          <div class="body">{this.messageJSX(this.messages)}</div>
          <div class="chatbot-control">
            <amplify-input
              placeholder="Write a message"
              fieldId="test"
              description="text"
              handleInputChange={evt => this.handleChange(evt)}
              value={this.text}
            ></amplify-input>
            <amplify-button class="icon-button" variant="icon" icon="microphone"></amplify-button>
            <amplify-button class="icon-button" variant="icon" icon="send" handleButtonClick={() => this.sendText()} />
          </div>
        </div>
      </Host>
    );
  }
}
