import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'amplify-field',
  styleUrl: 'amplify-field.css',
})
export class AmplifyField {
  /** The ID of the field.  Should match with its corresponding input's ID. */
  @Prop() fieldId: string;
  /** The text of the label.  Goes above the input. Ex: "First name" */
  @Prop() label: string | null;
  /** The text of the description.  Goes just below the label. */
  @Prop() description: string | null;
  /** The input type.  Can be any HTML input type. */
  @Prop() type?: string = "text";
  /** The callback, called when the input is modified by the user. */
  @Prop() onInput?: (arg0: Event) => void;

  render() {
    return (
      <div>
        {this.label && (
          <label htmlFor={this.fieldId} class="label">
            {this.label}
          </label>
        )}
        {this.description && (
          <div id={`${this.fieldId}-description`} class="description">
            {this.description}
          </div>
        )}
        <div>
          <amplify-input
            fieldId={this.fieldId}
            aria-describedby={this.fieldId && this.description ? `${this.fieldId}-description` : null}
            type={this.type}
            onInput={this.onInput}
          />
        </div>
      </div>
    );
  }
}
