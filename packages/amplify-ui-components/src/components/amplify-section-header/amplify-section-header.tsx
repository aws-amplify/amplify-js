import { Component, h } from '@stencil/core';
import { sectionHeader } from './amplify-section-header.style';

@Component({
  tag: 'amplify-section-header',
})
export class AmplifySectionHeader {
  render() {
    return (
      <h2 class={sectionHeader}>
        <slot />
      </h2>
    );
  }
}
