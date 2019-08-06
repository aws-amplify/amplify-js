import { Component, h, Prop } from '@stencil/core';
import { sectionHeader } from './amplify-section-header.style';
import { AMPLIFY_UI_SECTION_HEADER } from '../../common/constants';
import { styleNuker } from '../../common/helpers';

@Component({
  tag: 'amplify-section-header',
})
export class AmplifySectionHeader {
  @Prop() styleOverride: boolean = false;

  render() {
    return (
      <h2 class={styleNuker(this.styleOverride, AMPLIFY_UI_SECTION_HEADER, sectionHeader)}>
        <slot />
      </h2>
    );
  }
}
