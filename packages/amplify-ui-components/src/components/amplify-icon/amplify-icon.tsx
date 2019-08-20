import { Component, Prop, Watch, h } from '@stencil/core';
import { icon } from './amplify-icon.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';

import { icons, IconNameType } from './icons';

const staticIconClass = `${AMPLIFY_UI_PREFIX}--icon`;

@Component({
  tag: 'amplify-icon',
  shadow: false,
})
export class AmplifyIcon {
  /** (Required) Name of icon used to determine the icon rendered */
  @Prop() name: IconNameType;
  /** (Optional) Override default styling */
  @Prop() overrideStyle: boolean;

  @Watch('name')
  validateName(newValue: string) {
    const isBlank = typeof newValue == null;
    if (isBlank) { throw new Error('name: required') };
  }

  render() {
    return (
      <span class={styleNuker(this.overrideStyle, staticIconClass, icon)}>
        {icons[this.name]}
      </span>
    );
  }
}
