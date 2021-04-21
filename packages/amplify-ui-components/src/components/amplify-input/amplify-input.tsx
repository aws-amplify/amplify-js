import { Component, Prop, Host, h, Event, EventEmitter, Element, State } from '@stencil/core';
import { closestElement } from '../../common/helpers';
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
	// prettier-ignore
	@Event({
		eventName: 'formSubmit',
		composed: true,
		cancelable: true,
		bubbles: true,
	}) formSubmit: EventEmitter;
	@State() autoCompleted;

	@Element() el: HTMLAmplifyInputElement;

	private setAutoCompleteValue(event) {
		const target: HTMLInputElement = event.target
		const value = target.value;

		this.value = value;
		this.autoCompleted = true;
		this.handleInputChange(event)
	}

	componentWillLoad() {
		if (/Firefox/.test(navigator.userAgent)) return; // firefox autofill works
		const container = closestElement('amplify-auth-container', this.el)
		if (!container) return;

		const username: HTMLInputElement = container.querySelector("input[name='username']");
		const password: HTMLInputElement = container.querySelector("input[name='password']");

		if (!username || !password) return;

		if (closestElement('amplify-sign-in', this.el)) {
			if (this.name === 'username' || this.name === 'email' || this.name === 'phone_number') {
				username.addEventListener('input', (e) => {
					this.setAutoCompleteValue(e);
				}, false);
			}
			if (this.name === 'password') {
				password.addEventListener('input', (e) => {
					this.setAutoCompleteValue(e);
				}, false);
			}
			if (username) {
				username.click();
			}
		}
	}

	render() {
		return (
			<Host class="input-host">
				<input
					id={this.fieldId}
					aria-describedby={
						this.fieldId && this.description
							? `${this.fieldId}-description`
							: null
					}
					data-autocompleted={this.autoCompleted}
					type={this.type}
					onInput={event => { this.autoCompleted = false; this.handleInputChange(event) }}
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
