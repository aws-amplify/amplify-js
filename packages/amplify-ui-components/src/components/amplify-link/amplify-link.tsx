import { Component, Element, Prop, h } from '@stencil/core';
import { link } from './amplify-link.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';

const STATIC_LINK_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--link`;

@Component({
  tag: 'amplify-link',
  shadow: false,
})
export class AmplifyLink {
  @Element() el: HTMLElement;

  @Prop() role: string = 'navigation';
  @Prop() overrideStyle: boolean = false;

  render() {
    return (
      <a class={styleNuker(this.overrideStyle, STATIC_LINK_CLASS_NAME, link)} role={this.role}>
        <slot />
      </a>
    );
  }
}
