import { Component, Prop, h } from '@stencil/core';
import { actionButton } from './amplify-icon-button.style';
import { IconNameType } from '../amplify-icon/icons';

@Component({
  tag: 'amplify-icon-button',
  shadow: false,
})
export class AmplifySceneLoading {
  @Prop() name: IconNameType;
  @Prop() tooltip: string;
  @Prop() autoShowTooltip: boolean;

  render() {
    return (
      <button class={actionButton}>
        <amplify-icon name={this.name}></amplify-icon>
      </button>
    );
  }
}
