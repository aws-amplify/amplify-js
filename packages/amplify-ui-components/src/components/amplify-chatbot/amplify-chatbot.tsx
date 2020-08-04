import { Component, Host, h, Prop, State } from '@stencil/core';

interface Message {
  content: string;
  from: 'user' | 'bot';
}

const messageJSX = (messages: Message[]) => {
  return messages.map(message => <div class={`bubble ${message.from}`}>{message.content}</div>);
};

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

  handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.text = target.value;
  }

  send() {
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
    const testMessages: Message[] = [
      { content: 'Bot: hi', from: 'bot' },
      { content: 'User: hi', from: 'user' },
      {
        content:
          'long mesageeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        from: 'bot',
      },
    ];
    if (this.messages.length === 0) this.messages.push(...testMessages);
    return (
      <Host>
        <div class="amplify-chatbot">
          <div class="chatbot-content">
            <div class="header">{this.botTitle}</div>
            <div class="body">{messageJSX(this.messages)}</div>
          </div>
          <div class="chatbot-control">
            <input
              type="text"
              id="chatbot-text"
              placeholder="Write a message"
              value={this.text}
              onInput={e => this.handleChange(e)}
            />
            <span class="icon-button">
              <amplify-icon name="microphone" />
            </span>
            <span class="icon-button" onClick={() => this.send()}>
              <amplify-icon name="send" />
            </span>
          </div>
        </div>
      </Host>
    );
  }
}
