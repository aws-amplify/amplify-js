import { Component, Element, Prop, h } from '@stencil/core';
import { section } from './amplify-section.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_SECTION } from '../../common/constants';

@Component({
  tag: 'amplify-section',
  shadow: false,
})
export class AmplifyLink {
  @Element() el: HTMLElement;

  @Prop() role: string = 'application';
  @Prop() styleOverride: boolean = false;

  render() {
    return (
      <section class={styleNuker(this.styleOverride, AMPLIFY_UI_SECTION, section)} role={this.role}>
        <slot name="amplify-section-header" />
        <slot name="amplify-section-body" />
        <slot name="amplify-section-footer" />
      </section>
    );
  }
}
