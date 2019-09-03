import { Component, h, Prop } from '@stencil/core';
import { tooltip, autoShowTooltip } from './amplify-tooltip.style';
import { styleNuker, styleBranch } from '../../common/helpers';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';

const STATIC_TOOLTIP_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--tooltip`;

@Component({
  tag: 'amplify-tooltip',
  shadow: false,
})

export class AmplifyTooltip {
  /** (Required) The text in the tooltip */
  @Prop() text: string;
  /** (Optional) Override default styling */
  @Prop() overrideStyle: boolean = false;
  /** (Optional) Whether or not the tooltip should be automatically shown, i.e. not disappear when not hovered */
  @Prop() shouldAutoShow: boolean = false;

  render() {
    const emotionTooltipClass = styleBranch(this.shouldAutoShow, tooltip, autoShowTooltip, null);
    return (
      <div class={styleNuker(this.overrideStyle, STATIC_TOOLTIP_CLASS_NAME, emotionTooltipClass)} data-text={this.text}>
        <slot />
      </div>
    );
  }
}
