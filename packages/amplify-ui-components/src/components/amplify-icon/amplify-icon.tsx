import { Component, Prop, Watch, h } from '@stencil/core';
import { icon } from './amplify-icon.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_ICON } from '../../common/constants';

export type IconNameType = 'sound-mute' | 'sound' | 'maximize' | 'minimize' | 'enter-vr' | 'exit-vr';

import { icons } from './icons';

@Component({
  tag: 'amplify-icon',
  shadow: false,
})
export class AmplifyIcon {
  /** (Required) Icon name used to determine the icon rendered */
  @Prop() name: IconNameType;
  @Prop() overrideStyle: boolean;

  @Watch('name')
  validateName(newValue: string) {
    const isBlank = typeof newValue == null;
    if (isBlank) { throw new Error('name: required') };
  }

  render() {
    return (
      <span class={styleNuker(this.overrideStyle, AMPLIFY_UI_ICON, icon)}>
        {icons[this.name]}
      </span>
    );
  }
}
