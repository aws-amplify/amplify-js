import { Component, Element, Prop, h } from '@stencil/core';
import { link } from './amplify-link.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_LINK } from '../../common/constants';

@Component({
  tag: 'amplify-link',
  shadow: false,
})
export class AmplifyLink {
  @Element() el: HTMLElement;

  @Prop() role: string = 'navigation';
  @Prop() styleOverride: boolean = false;

  render() {
    return (
      <a class={styleNuker(this.styleOverride, AMPLIFY_UI_LINK, link)} role={this.role}>
        <slot />
      </a>
    );
  }
}
