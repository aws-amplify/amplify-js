import { storiesOf } from '@storybook/html';
import { text as textKnob } from '@storybook/addon-knobs';

const radioButtonStories = storiesOf('amplify-radio-button', module);

radioButtonStories.add('with label', () => {
  const label = textKnob('Label', 'Seattle');
  return `<amplify-radio-button label=${label}></amplify-radio-button>`;
});
