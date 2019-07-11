import { Component, Element, Prop, h } from '@stencil/core';
import { section } from './amplify-section.style';

@Component({
  tag: 'amplify-section',
  shadow: false,
})
export class AmplifyLink {
  @Element() el: HTMLElement;

  @Prop() role: string = 'application';

  render() {
    return (
      <section class={section} role={this.role}>
        <slot />
      </section>
    );
  }
}
