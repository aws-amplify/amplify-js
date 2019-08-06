import { Component, Prop, h } from '@stencil/core';
import { textInput } from './amplify-input.style';

@Component({
  tag: 'amplify-input',
})
export class AmplifyInput {
  /** The ID of the field.  Should match with its corresponding input's ID. */
  @Prop() fieldId: string;
  /** The text of the description.  Goes just below the label. */
  @Prop() description: string | null;
  /** The input type.  Can be any HTML input type. */
  @Prop() type?: string = "text";
  /** The callback, called when the input is modified by the user. */
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
