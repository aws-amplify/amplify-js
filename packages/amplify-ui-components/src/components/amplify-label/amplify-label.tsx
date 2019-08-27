import { Component, Prop, h } from '@stencil/core';
import { label } from './amplify-label.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';

const STATIC_LABEL_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--label`;

@Component({
  tag: 'amplify-label',
  shadow: false,
})
export class AmplifyLabel {
  @Prop() htmlFor: string;
  @Prop() overrideStyle: boolean = false;

  render() {
    return (
      <label class={styleNuker(this.overrideStyle, STATIC_LABEL_CLASS_NAME, label)} htmlFor={this.htmlFor}>
        <slot />
      </label>
    );
  }
}
