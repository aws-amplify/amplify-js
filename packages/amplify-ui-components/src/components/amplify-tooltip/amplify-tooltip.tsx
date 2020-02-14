import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'amplify-tooltip',
  shadow: true,
})
export class AmplifyTooltip {
  /** (Required) The text in the tooltip */
  @Prop() text: string;
  /** (Optional) Override default styling */
  @Prop() overrideStyle: boolean = false;
  /** (Optional) Whether or not the tooltip should be automatically shown, i.e. not disappear when not hovered */
  @Prop() shouldAutoShow: boolean = false;

  render() {
    return (
      <div class={{ tooltip: true, 'auto-show-tooltip': this.shouldAutoShow }} data-text={this.text}>
        <slot />
      </div>
    );
  }
}
