import { Component, Prop, Host, h, Element, State } from '@stencil/core';
import { closestElement, onAuthUIStateChange } from '../../common/helpers';
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
	/** Whether the input has been autocompleted */
	@State() autoCompleted = false;
	private removeHubListener: () => void;

	@Element() el: HTMLAmplifyInputElement;

	/**
	 * Sets the value of this input to the value in autofill input event.
	 */
	private setAutoCompleteValue(value: string) {
		const input = this.el.querySelector('input');
		if (!input) return;
		input.value = value;
		// dispatch an input event from this element to the parent form
		input.dispatchEvent(new Event('input'));
		this.autoCompleted = true;
	}

	/**
	 * Checks if the target dummy input in `amplify-auth-container` is present have been autofilled.
	 * If so, we update this.value with the autofilled value.
	 */
	private checkAutoCompletion(targetInput: HTMLInputElement) {
		if (!targetInput) return;
		if (targetInput.value) {
			// if value is already set, we set the value directly
			this.setAutoCompleteValue(targetInput.value);
		} else {
			// if value is not set, we start listening for it
			targetInput.addEventListener('input', e => {
				const value = (e.target as HTMLInputElement).value;
				this.setAutoCompleteValue(value);
			});
		}
	}

	disconnectedCallback() {
		this.removeHubListener && this.removeHubListener(); // stop listening to `onAuthUIStateChange`
	}

	componentWillLoad() {
		// the below behaviors are only applicable if `amplify-input` is used by `amplify-authenticator`.
		if (!closestElement('amplify-authenticator', this.el)) return;

		this.removeHubListener = onAuthUIStateChange(() => {
			/**
			 * When we're using slots, autofilled data will persist between different authState,
			 * even though input events are not triggered. This ends up in parent components
			 * not picking up input values. For now, we're emptying the input on authState change
			 * which is the existing behavior.
			 */
			const input = this.el.querySelector('input');
			if (input) input.value = '';
			this.autoCompleted = false;
		});
	}

	componentDidLoad() {
		// no-op if this field already has been autofilled or already has an value
		if (this.autoCompleted || this.value) return;

		if (/Firefox/.test(navigator.userAgent)) return; // firefox autofill works
		const container = closestElement('amplify-auth-container', this.el);
		const signIn = closestElement('amplify-sign-in', this.el);

		// only autocomplete if `amplify-auth-container` is present and input is under `sign-in`.
		if (!container || !signIn) return;

		const username: HTMLInputElement = container.querySelector(
			"input[name='username']"
		);
		const password: HTMLInputElement = container.querySelector(
			"input[name='password']"
		);

		if (
			this.name === 'username' ||
			this.name === 'email' ||
			this.name === 'phone'
		) {
			this.checkAutoCompletion(username);
		} else if (this.name === 'password') {
			this.checkAutoCompletion(password);
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
					onInput={event => {
						this.autoCompleted = false;
						this.handleInputChange(event);
					}}
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
