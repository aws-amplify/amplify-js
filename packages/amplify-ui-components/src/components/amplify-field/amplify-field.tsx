import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'amplify-field',
  styleUrl: 'amplify-field.css',
})
export class AmplifyField {
  @Prop() fieldId: string;
  @Prop() label: string | null;
  @Prop() description: string | null;
  @Prop() type?: string = "text";
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
