import { Component, Prop, h } from '@stencil/core';
import { textInput } from './amplify-input.style';

@Component({
  tag: 'amplify-input',
})
export class AmplifyInput {
  @Prop() fieldId: string;
  @Prop() label: string | null;
  @Prop() description: string | null;
  @Prop() type?: string = "text";
  @Prop() onInput?: (arg0: Event) => void;

  render() {
    return (
      <input
        id={this.fieldId}
        aria-describedby={this.fieldId && this.description ? `${this.fieldId}-description` : null}
        type={this.type}
        onInput={this.onInput}
        class={textInput}
      />
    );
  }
}
