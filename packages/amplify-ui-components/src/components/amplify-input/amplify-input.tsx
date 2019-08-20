import { Component, Prop, h } from '@stencil/core';
import { input } from './amplify-input.style';
import { styleNuker } from '../../common/helpers';
import { TextFieldTypes } from '../../common/types';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';

const STATIC_INPUT_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--input`;

@Component({
  tag: 'amplify-input',
  shadow: false,
})
export class AmplifyInput {
  /** The ID of the field.  Should match with its corresponding input's ID. */
  @Prop() fieldId: string;
  /** The text of the description.  Goes just below the label. */
  @Prop() description: string | null;
  /** The input type.  Can be any HTML input type. */
  @Prop() type?: TextFieldTypes = 'text';
  /** The callback, called when the input is modified by the user. */
  @Prop() onInputChange?: (inputEvent: Event) => void;
  /** (Optional) The placeholder for the input element.  Using hints is recommended, but placeholders can also be useful to convey information to users. */
  @Prop() placeholder?: string = '';
  /** (Optional) Override default styling */
  @Prop() overrideStyle?: boolean = false;

  render() {
    return (
      <input
        id={this.fieldId}
        aria-describedby={this.fieldId && this.description ? `${this.fieldId}-description` : null}
        type={this.type}
        onInput={this.onInputChange}
        placeholder={this.placeholder}
        class={styleNuker(this.overrideStyle, STATIC_INPUT_CLASS_NAME, input)}
      />
    );
  }
}
