import { storiesOf } from '@storybook/html';
import { boolean as booleanKnob } from '@storybook/addon-knobs';
import { knobs } from '../../common/testing';

const checkboxStories = storiesOf('amplify-checkbox', module);

checkboxStories.add('with label', () => {
  const label = knobs.labelKnob('Boise');
  const override = knobs.overrideStyleKnob();

  return `<amplify-checkbox label=${label} name="boise" field-id="boise" value="boise" override-style=${override}></amplify-checkbox>`;
});

checkboxStories.add('toggle check box', () => {
  const label = knobs.labelKnob('Boise');
  const toggle = booleanKnob('Checkbox toggle', false);
  const override = knobs.overrideStyleKnob();

  return `<amplify-checkbox label=${label} name="boise" field-id="boise" value="boise" checked=${toggle} override-style=${override}></amplify-checkbox>`;
});

checkboxStories.add('disabled', () => {
  const label = knobs.labelKnob('Portland');
  const toggle = booleanKnob('Disable', true);
  const override = knobs.overrideStyleKnob();

  return `<amplify-checkbox label=${label} name="portland" field-id="portland" value="portland" disabled=${toggle} override-style=${override}></amplify-checkbox>`;
});


