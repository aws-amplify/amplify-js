import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'amplify-hint',
  styleUrl: 'amplify-hint.scss',
  shadow: true,
})
export class AmplifyHint {
  /** (Optional) Override default styling */
  @Prop() overrideStyle: boolean = false;

  render() {
    return (
      <div class="hint">
        <slot />
      </div>
    );
  }
}
