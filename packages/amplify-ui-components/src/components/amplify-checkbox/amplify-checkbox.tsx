import { Component, Prop, h } from '@stencil/core';
import { checkbox } from './amplify-checkbox.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_CHECKBOX } from '../../common/constants';

@Component({
  tag: 'amplify-checkbox',
  shadow: false,
})
export class AmplifyCheckbox {
  @Prop() styleOverride: boolean = false;
  @Prop() inputProps: {
    type: string;
    name?: string;
    value?: any;
    checked?: boolean;
  }

  render() {
    this.inputProps.type = 'checkbox';

    return (
      <input
        class={styleNuker(this.styleOverride, AMPLIFY_UI_CHECKBOX, checkbox)}
        {...this.inputProps}
      />
    );
  }
}