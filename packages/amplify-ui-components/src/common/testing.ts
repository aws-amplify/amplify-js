import { select as selectKnob, text as textKnob } from '@storybook/addon-knobs';

export const pixelThreshold = 10;

export const selectors = {
    // amplify-form-field
    formFieldDescription: '[data-test=form-field-description]',
}

export const knobs = {
    labelKnob: function (placeholder: string) {
        return textKnob('Label', placeholder);
    },

    descriptionKnob: function (placeholder: string) {
        return textKnob('Description', placeholder);
    },

    hintKnob: function (placeholder: string) {
        return textKnob('Hint', placeholder);
    },

    inputTypeKnob: function (placeholder: string) {
        return selectKnob('Type', ['date', 'email', 'number', 'password', 'search', 'tel', 'text', 'url', 'time'], placeholder);
    },

    placeholderKnob: function (placeholder: string) {
        return textKnob('Placeholder', placeholder);
    }
}