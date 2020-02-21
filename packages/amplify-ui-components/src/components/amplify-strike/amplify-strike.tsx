import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'amplify-strike',
  styleUrl: 'amplify-strike.scss',
  scoped: true,
})
export class AmplifyStrike {
  /** (Optional) Override default styling */
  @Prop() overrideStyle: boolean = false;

  render() {
    return (
      <Host class="strike">
        <span class="strike-content">
          <slot />
        </span>
      </Host>
    );
  }
}
