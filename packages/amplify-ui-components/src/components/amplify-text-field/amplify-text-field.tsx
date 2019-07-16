import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'amplify-text-field',
  styleUrl: 'amplify-text-field.css',
})
export class AmplifyTextField {
  @Prop() fieldId: string;
  @Prop() label: string | null;
  @Prop() description: string | null;
  @Prop() inputProps: {
    type?: string;
    onInput?: (Event) => void;
  } = {};

  render() {
    this.inputProps.type = this.inputProps.type || 'text';

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
          <amplify-text-input
            id={this.fieldId}
            aria-describedby={this.fieldId && this.description ? `${this.fieldId}-description` : null}
            inputProps={{ ...this.inputProps }}
          />
        </div>
      </div>
    );
  }
}
