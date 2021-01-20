import { Component, Prop, Host, h, Listen, Event, EventEmitter } from '@stencil/core';
import { TextFieldTypes, InputEvent } from '../../common/types/ui-types';

@Component({
  tag: 'amplify-input',
  styleUrl: 'amplify-input.scss',
})
export class AmplifyInput {
  /** The ID of the field.  Should match with its corresponding input's ID. */
  @Prop() fieldId: string;
  /** The text of the description.  Goes just below the label. */
  @Prop() description: string | null;
  /** The input type.  Can be any HTML input type. */
  @Prop() type?: TextFieldTypes = 'text';
  /** The callback, called when the input is modified by the user. */
  @Prop() handleInputChange?: (inputEvent: InputEvent) => void = () => void 0;
  /** (Optional) The placeholder for the input element.  Using hints is recommended, but placeholders can also be useful to convey information to users. */
  @Prop() placeholder?: string = '';
  /** (Optional) String value for the name of the input. */
  @Prop() name?: string;
  /** The value of the content inside of the input field */
  @Prop() value: string;
  /** Attributes places on the input element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes */
  @Prop() inputProps?: object;
  /** Will disable the input if set to true */
  @Prop() disabled?: boolean;
  /** Event formSubmit is emitted on keydown 'Enter' on an input and can be listened to by a parent form */
  @Event({
    eventName: 'formSubmit',
    composed: true,
    cancelable: true,
    bubbles: true,
  }) formSubmit: EventEmitter;

  // eslint-disable-next-line
  @Listen('keydown')
  handleKeyDown(ev) {
    if (ev.key === 'Enter') {
      this.formSubmit.emit(ev);
    }
  }

  render() {
    return (
      <Host class="input-host">
        <input
          id={this.fieldId}
          aria-describedby={this.fieldId && this.description ? `${this.fieldId}-description` : null}
          type={this.type}
          onInput={event => this.handleInputChange(event)}
          placeholder={this.placeholder}
          name={this.name}
          class="input"
          value={this.value}
          disabled={this.disabled}
          {...this.inputProps}
        />
      </Host>
    );
  }
}
