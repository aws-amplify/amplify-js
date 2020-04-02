import { Component, Element, Prop, h } from '@stencil/core';

@Component({
  tag: 'amplify-section',
  styleUrl: 'amplify-section.scss',
  shadow: true,
})
export class AmplifySection {
  @Element() el: HTMLElement;

  @Prop() role: string = 'application';

  render() {
    return (
      <section class="section" role={this.role}>
        <slot />
      </section>
    );
  }
}
