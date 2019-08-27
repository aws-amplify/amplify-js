import { storiesOf } from '@storybook/html';
import { boolean as booleanKnob } from '@storybook/addon-knobs';
import { knobs } from '../../common/testing';

const radioButtonStories = storiesOf('amplify-radio-button', module);

radioButtonStories.add('with label', () => {
  const label = knobs.labelKnob('Seattle');
  const override = knobs.overrideStyleKnob();

  return `<amplify-radio-button label=${label} field-id="seattle" name="seattle" override-style=${override}></amplify-radio-button>`;
});

radioButtonStories.add('checkable radio button', () => {
  const label = knobs.labelKnob('Oceanside');
  const toggle = booleanKnob('Toggle', false);
  const override = knobs.overrideStyleKnob();

  return `<amplify-radio-button label=${label} field-id="oceanside" name="oceanside" checked=${toggle} override-style=${override}></amplify-radio-button>`;
});

radioButtonStories.add('disabled', () => {
  const label = knobs.labelKnob('Moscow');
  const toggle = booleanKnob('Disabled', true);
  const override = knobs.overrideStyleKnob();

  return `<amplify-radio-button label=${label} field-id="moscow" name="moscow" disabled=${toggle} override-style=${override}></amplify-radio-button>`;
});
