import { storiesOf } from '@storybook/html';
import { text as textKnob } from '@storybook/addon-knobs';

const formSectionStories = storiesOf('amplify-form-section', module);

formSectionStories.add('Default', () => {
  return `<amplify-form-section></amplify-form-section>`;
});

formSectionStories.add('custom button text', () => {
  const buttonLabel = textKnob('Submit Button', 'Go');

  return `<amplify-form-section button-label=${buttonLabel}></amplify-form-section>`;
});
