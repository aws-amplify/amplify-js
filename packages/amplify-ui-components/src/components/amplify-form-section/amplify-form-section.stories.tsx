import { storiesOf } from '@storybook/html';
import { text as textKnob } from '@storybook/addon-knobs';

const formSectionStories = storiesOf('amplify-form-section', module);

formSectionStories.add('default', () => {
  return `
  <amplify-form-section></amplify-form-section>`;
});

formSectionStories.add('custom button text', () => {
  const submitButtonText = textKnob('Submit button', 'Go');

  return `<amplify-form-section submit-button-text=${submitButtonText}></amplify-form-section>`;
});
