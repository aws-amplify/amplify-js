import { Component, Prop, Watch, h } from '@stencil/core';
import { icons, IconNameType } from './icons';

@Component({
  tag: 'amplify-icon',
  styleUrl: 'amplify-icon.scss',
  shadow: true,
})
export class AmplifyIcon {
  /** (Required) Name of icon used to determine the icon rendered */
  @Prop() name: IconNameType;
  /** (Optional) Override default styling */
  @Prop() overrideStyle: boolean = false;

  @Watch('name')
  validateName(newValue: string) {
    const isBlank = typeof newValue == null;
    if (isBlank) {
      throw new Error('name: required');
    }
  }

  render() {
    return <span class="icon">{icons[this.name]}</span>;
  }
}
