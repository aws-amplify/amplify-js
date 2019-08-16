import { select as selectKnob, text as textKnob } from '@storybook/addon-knobs';

export const pixelThreshold = 10;

export const selectors = {
    // amplify-form-field
    formFieldDescription: '[data-test=form-field-description]',
}

export const knobs = {
    labelKnob (labelPlaceholder: string) {
        return textKnob('Label', labelPlaceholder);
    },

    descriptionKnob (descriptionPlaceholder: string) {
        return textKnob('Description', descriptionPlaceholder);
    },

    hintKnob (hintPlaceholder: string) {
        return textKnob('Hint', hintPlaceholder);
    },

    inputTypeKnob (inputTypePlaceholder: string) {
        return selectKnob('Type', ['date', 'email', 'number', 'password', 'search', 'tel', 'text', 'url', 'time'], inputTypePlaceholder);
    },

    placeholderKnob (placeholderPlaceholder: string) {
        return textKnob('Placeholder', placeholderPlaceholder);
    }
}