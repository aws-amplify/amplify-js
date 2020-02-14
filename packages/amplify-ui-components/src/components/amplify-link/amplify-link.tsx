import { Component, Element, Prop, h } from '@stencil/core';

@Component({
  tag: 'amplify-link',
  styleUrl: 'amplify-link.scss',
  shadow: true,
})
export class AmplifyLink {
  @Element() el: HTMLElement;

  @Prop() role: string = 'navigation';
  @Prop() overrideStyle: boolean = false;

  render() {
    return (
      <a class="link" role={this.role}>
        <slot />
      </a>
    );
  }
}
