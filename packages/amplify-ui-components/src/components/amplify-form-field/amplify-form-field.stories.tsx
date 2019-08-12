import { storiesOf } from '@storybook/html';
import { select as selectKnob, text as textKnob } from '@storybook/addon-knobs';

function labelKnob(placeholder) {
  return textKnob('Label', placeholder);
}

function descriptionKnob(placeholder) {
  return textKnob('Description', placeholder);
}

function hintKnob(placeholder) {
  return textKnob('Hint', placeholder);
}

function typeKnob(placeholder) {
  return selectKnob('Type', ['date', 'email', 'number', 'password', 'search', 'tel', 'text', 'url', 'time'], placeholder);
}

function placeholderKnob(placeholder) {
  return textKnob('Placeholder', placeholder);
}

storiesOf('amplify-form-field', module).add('generalized', () => {
  const label = labelKnob('Label placeholder');
  const description = descriptionKnob('Description placeholder');
  const hint = hintKnob('Hint placeholder');
  const type = typeKnob('text');
  const placeholder = placeholderKnob('Placeholder placeholder');
  return `<amplify-form-field field-id="id" label="${label}" description="${description}" hint="${hint}" type="${type}" placeholder="${placeholder}"/>`;
});

storiesOf('amplify-form-field', module).add('password example', () => {
  const label = labelKnob('Enter your password');
  const description = descriptionKnob('Passwords should be kept safe!');
  const hint = hintKnob('Click here to reset your password');
  const type = typeKnob('password');
  const placeholder = placeholderKnob('Type here!');
  return `<amplify-form-field field-id="id" label="${label}" description="${description}" hint="${hint}" type="${type}" placeholder="${placeholder}"/>`;
});

storiesOf('amplify-form-field', module).add('number example', () => {
  const label = labelKnob('Enter in some numbers!');
  const description = descriptionKnob(`Don't you dare try to enter text here`);
  const hint = hintKnob('It turns out you can type e and . in number inputs');
  const type = typeKnob('number');
  const placeholder = placeholderKnob('12345');
  return `<amplify-form-field field-id="id" label="${label}" description="${description}" hint="${hint}" type="${type}" placeholder="${placeholder}"/>`;
});
