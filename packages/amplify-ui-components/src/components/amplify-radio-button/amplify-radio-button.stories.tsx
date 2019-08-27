import { storiesOf } from '@storybook/html';
import { knobs } from '../../common/testing';

const radioButtonStories = storiesOf('amplify-radio-button', module);

radioButtonStories.add('with label', () => {
  const label = knobs.labelKnob('Seattle');
  const override = knobs.overrideStyleKnob();

  return `<amplify-radio-button label=${label} field-id="seattle" name="seattle" override-style=${override}></amplify-radio-button>`;
});

radioButtonStories.add('checkable radio button', () => {
  const label = knobs.labelKnob('Oceanside');
  const toggle = knobs.toggleKnob(false);
  const override = knobs.overrideStyleKnob();

  return `<amplify-radio-button label=${label} field-id="oceanside" name="oceanside" checked=${toggle} override-style=${override}></amplify-radio-button>`;
});

radioButtonStories.add('disabled', () => {
  const label = knobs.labelKnob('Moscow');
  const disabled = knobs.disabledKnob(true);
  const override = knobs.overrideStyleKnob();

  return `<amplify-radio-button label=${label} field-id="moscow" name="moscow" disabled=${disabled} override-style=${override}></amplify-radio-button>`;
});
