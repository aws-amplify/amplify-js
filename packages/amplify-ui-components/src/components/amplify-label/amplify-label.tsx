import { Component, Prop, h } from '@stencil/core';
import { label } from './amplify-label.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_LABEL } from '../../common/constants';
@Component({
  tag: 'amplify-label',
  shadow: false,
})
export class AmplifyLabel {
  @Prop() htmlFor: string;
  @Prop() styleOverride: boolean = false;

  render() {
    return (
      <label class={styleNuker(this.styleOverride, AMPLIFY_UI_LABEL, label)} htmlFor={this.htmlFor}>
        <slot />
      </label>
    );
  }
}
