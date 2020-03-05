import { Component, h, State, Prop, Watch, Event, EventEmitter, Host } from '@stencil/core';

@Component({
  tag: 'amplify-radio-group',
})
export class AmplifyRadioGroup {
  @State() checkedRadio = null;
  @Prop({ mutable: true }) value = null;

  @Watch('value')
  watchHandler(value: any | null) {
    console.log('emiting', value);
    this.radioChange.emit({ value });
  }

  @Event() radioChange!: EventEmitter;

  handleRadioChange(event) {
    const selectedRadioButton = event.target && (event.target as HTMLElement).closest('amplify-radio-button');
    if (selectedRadioButton) {
      const currentValue = this.value;
      const newValue = selectedRadioButton.value;
      if (newValue !== currentValue) {
        this.value = newValue;
      }
    }
  }

  render() {
    return (
      <Host onChange={this.handleRadioChange}>
        <slot />
      </Host>
    );
  }
}
