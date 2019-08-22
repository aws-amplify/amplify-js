import { Component, Element, Prop, h } from '@stencil/core';
import { section } from './amplify-section.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';

const STATIC_SECTION_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--section`;

@Component({
  tag: 'amplify-section',
  shadow: false,
})
export class AmplifySection {
  @Element() el: HTMLElement;

  @Prop() role: string = 'application';
  @Prop() overrideStyle?: boolean = false;

  render() {
    return (
      <section class={styleNuker(this.overrideStyle, STATIC_SECTION_CLASS_NAME, section)} role={this.role}>
        <slot />
      </section>
    );
  }
}
