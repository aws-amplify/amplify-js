import { storiesOf } from '@storybook/html';
import { text as textKnob, boolean as booleanKnob } from '@storybook/addon-knobs';

const radioButtonStories = storiesOf('amplify-radio-button', module);

radioButtonStories.add('with label', () => {
  const label = textKnob('Label', 'Seattle');

  return `<amplify-radio-button label=${label} field-id="seattle" name="seattle"></amplify-radio-button>`;
});

radioButtonStories.add('checkable radio button', () => {
  const label = textKnob('Label', 'Oceanside');
  const toggle = booleanKnob('Toggle', false);

  return `<amplify-radio-button label=${label} field-id="oceanside" name="oceanside" checked=${toggle}></amplify-radio-button>`;
});

radioButtonStories.add('disabled', () => {
  const label = textKnob('Label', 'Moscow');
  const toggle = booleanKnob('Disabled', true);

  return `<amplify-radio-button label=${label} field-id="moscow" name="moscow" disabled=${toggle}></amplify-radio-button>`;
});
