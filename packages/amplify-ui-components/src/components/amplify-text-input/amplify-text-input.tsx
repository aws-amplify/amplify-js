import { Component, Prop, h } from '@stencil/core';
import { textInput } from './amplify-text-input.style';

@Component({
  tag: 'amplify-text-input',
})
export class AmplifyTextInput {
  @Prop() fieldId: string;
  @Prop() label: string | null;
  @Prop() description: string | null;
  @Prop() inputProps: {
    type?: string;
    onInput?: (Event) => void;
  } = {};

  render() {
    return (
      <input
        id={this.fieldId}
        aria-describedby={this.fieldId && this.description ? `${this.fieldId}-description` : null}
        type={this.inputProps.hasOwnProperty('type') ? this.inputProps.type : 'text'}
        {...this.inputProps}
        class={textInput}
      />
    );
  }
}
