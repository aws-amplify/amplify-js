import { Component, Prop, h } from '@stencil/core';
import { textInput } from './amplify-text-input.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_TEXT_INPUT } from '../../common/constants';

@Component({
  tag: 'amplify-text-input',
})
export class AmplifyTextInput {
  @Prop() fieldId: string;
  @Prop() inputProps: {
    placeholder?: string;
    type?: string;
    onInput?: (Event) => void;
  } = {};
  @Prop() styleOverride: boolean = false;

  render() {
    this.inputProps.type = this.inputProps.type || 'text';

    return (
      <input
        class={styleNuker(this.styleOverride, AMPLIFY_UI_TEXT_INPUT, textInput)}
        {...this.inputProps}
      />
    );
  }
}
