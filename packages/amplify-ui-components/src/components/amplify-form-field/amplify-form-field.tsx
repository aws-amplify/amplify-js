import { Component, Prop, h } from '@stencil/core';
import { formField } from './amplify-form-field.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_FORM_FIELD } from '../../common/constants';

@Component({
  tag: 'amplify-form-field',
  shadow: false,
})
export class AmplifyTextField {
  @Prop() fieldId: string;
  @Prop() label: string | null;
  @Prop() hint: string | null;
  @Prop() inputProps: {
    type?: string;
    onInput?: (Event) => void;
  } = {};
  @Prop() styleOverride: boolean = false;

  render() {
    return (
      <div class={styleNuker(this.styleOverride, AMPLIFY_UI_FORM_FIELD, formField)}>
        {this.label && <amplify-label htmlFor={this.fieldId}>{this.label}</amplify-label>}
        <amplify-text-input
          id={this.fieldId}
          aria-describedby={this.fieldId && this.hint ? `${this.fieldId}-description` : null}
          type="text"
          {...this.inputProps}
        />
        {this.hint && (<amplify-hint id={`${this.fieldId}-description`}>{this.hint}</amplify-hint>)}
      </div>
    );
  }
}
