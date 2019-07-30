import { Component, Prop, h } from '@stencil/core';
import { formField } from './amplify-form-field.style';

@Component({
  tag: 'amplify-form-field',
  shadow: false,
})
export class AmplifyField {
  @Prop() fieldId: string;
  @Prop() label: string | null;
  @Prop() hint: string | null;
  @Prop() inputProps: {
    type?: string;
    onInput?: (Event) => void;
  } = {};

  render() {
    const type = this.inputProps.type || "text";

    return (
      <div class={formField}>
        {this.label && <amplify-label htmlFor={this.fieldId}>{this.label}</amplify-label>}
        <amplify-input
          id={this.fieldId}
          aria-describedby={this.fieldId && this.hint ? `${this.fieldId}-description` : null}
          type={type}
          onInput={this.inputProps.onInput}
        />
        {this.hint && (
          // <div id={`${this.fieldId}-description`} class="description">
          //   {this.description}
          // </div>
          <amplify-hint id={`${this.fieldId}-description`}>{this.hint}</amplify-hint>
        )}
      </div>
    );
  }
}
