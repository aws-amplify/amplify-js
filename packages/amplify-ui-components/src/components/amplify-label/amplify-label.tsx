import { Component, Prop, h } from '@stencil/core';
import { label } from './amplify-label.style';
@Component({
  tag: 'amplify-label',
  shadow: false,
})
export class AmplifyLabel {
  @Prop() htmlFor: string;

  render() {
    return (
      <label class={label} htmlFor={this.htmlFor}>
        <slot />
      </label>
    );
  }
}
