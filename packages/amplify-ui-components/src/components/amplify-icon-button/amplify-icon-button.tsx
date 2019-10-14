import { Component, Prop, h } from '@stencil/core';
import { actionButton } from './amplify-icon-button.style';
import { styleNuker } from '../../common/helpers';
import { IconNameType } from '../amplify-icon/icons';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';

const STATIC_ICON_BUTTON_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--button`;
@Component({
  tag: 'amplify-icon-button',
  shadow: false,
})
export class AmplifyIconButton {
  /* The name of the icon used inside of the button */
  @Prop() name: IconNameType;
  /* (Optional) The tooltip that will show on hover of the button */
  @Prop() tooltip: string | null = null;
  /* (Optional) Whether or not to show the tooltip automatically */
  @Prop() autoShowTooltip: boolean = false;
  /** (Optional) Override default styling */
  @Prop() overrideStyle: boolean = false;

  render() {
    return (
      <span class={styleNuker(this.overrideStyle, STATIC_ICON_BUTTON_CLASS_NAME, actionButton)}>
        <amplify-tooltip text={this.tooltip} shouldAutoShow={this.autoShowTooltip}>
          <button>
            <amplify-icon name={this.name} />
          </button>
        </amplify-tooltip>
      </span>
    );
  }
}
