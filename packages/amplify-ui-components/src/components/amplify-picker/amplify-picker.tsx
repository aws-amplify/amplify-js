import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'amplify-picker',
  styleUrl: 'amplify-picker.scss',
  shadow: true,
})
export class AmplifyPicker {
  @Prop() pickerText: string = 'Pick a file';
  @Prop() acceptValue: string = '*/*';
  @Prop() inputHandler: (e: Event) => void;

  render() {
    return (
      <div class="picker">
        <slot name="picker">
          <amplify-button>{this.pickerText}</amplify-button>
        </slot>
        <input title={this.pickerText} type="file" accept={this.acceptValue} onChange={e => this.inputHandler(e)} />
      </div>
    );
  }
}
