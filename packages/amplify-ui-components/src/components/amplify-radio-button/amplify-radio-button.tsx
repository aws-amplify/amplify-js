import { Component, Prop, h } from '@stencil/core';
import { radioButton } from './amplify-radio-button.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_RADIO_BUTTON } from '../../common/constants';

@Component({
  tag: 'amplify-radio-button',
  shadow: false,
})
export class AmplifyRadioButton {
  @Prop() styleOverride: boolean = false;
  @Prop() inputProps: {
    type: string;
    name?: string;
    value?: any;
    checked?: boolean;
  }

  render() {
    this.inputProps.type = 'radio';

    return (
      <input
        class={styleNuker(this.styleOverride, AMPLIFY_UI_RADIO_BUTTON, radioButton)}
        {...this.inputProps}
      />
    );
  }
}