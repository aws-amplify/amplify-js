import {
	boolean as booleanKnob,
	select as selectKnob,
	text as textKnob,
} from '@storybook/addon-knobs';

export const pixelThreshold = 10;

export const selectors = {
	// amplify-form-field
	formFieldDescription: '[data-test=form-field-description]',
};

export const knobs = {
	labelKnob(labelPlaceholder: string) {
		return textKnob('Label', labelPlaceholder);
	},

	descriptionKnob(descriptionPlaceholder: string) {
		return textKnob('Description', descriptionPlaceholder);
	},

	hintKnob(hintPlaceholder: string) {
		return textKnob('Hint', hintPlaceholder);
	},

	inputTypeKnob(inputTypePlaceholder: string) {
		return selectKnob(
			'Type',
			[
				'date',
				'email',
				'number',
				'password',
				'search',
				'tel',
				'text',
				'url',
				'time',
			],
			inputTypePlaceholder
		);
	},

	placeholderKnob(placeholderPlaceholder: string) {
		return textKnob('Placeholder', placeholderPlaceholder);
	},

	buttonTypeKnob(buttonTypePlaceholder: string) {
		return selectKnob(
			'Button type',
			['button', 'submit', 'reset'],
			buttonTypePlaceholder
		);
	},

	buttonTextKnob(buttonTextPlaceholder: string) {
		return textKnob('Button text', buttonTextPlaceholder);
	},

	toggleKnob(toggleDefault: boolean) {
		return booleanKnob('Toggle', toggleDefault);
	},

	disabledKnob(disabledDefault: boolean) {
		return booleanKnob('Disabled', disabledDefault);
	},

	formSectionHeaderKnob(headerPlaceholder: string) {
		return textKnob('Header text', headerPlaceholder);
	},

	formSectionSubmitKnob(submitPlaceholder: string) {
		return textKnob('Submit button text', submitPlaceholder);
	},

	tooltipAutoShowKnob(autoShowDefault: boolean) {
		return booleanKnob('Tooltip autoshow', autoShowDefault);
	},
};
