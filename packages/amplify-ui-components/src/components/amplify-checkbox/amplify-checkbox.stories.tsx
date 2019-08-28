import { storiesOf } from '@storybook/html';
import { knobs } from '../../common/testing';

const checkboxStories = storiesOf('amplify-checkbox', module);

checkboxStories.add('with label', () => {
  const label = knobs.labelKnob('Boise');
  const override = knobs.overrideStyleKnob();

  return `<amplify-checkbox label=${label} name="boise" field-id="boise" value="boise" override-style=${override}></amplify-checkbox>`;
});

checkboxStories.add('toggle check box', () => {
  const label = knobs.labelKnob('Boise');
  const toggle = knobs.toggleKnob(false);
  const override = knobs.overrideStyleKnob();

  return `<amplify-checkbox label=${label} name="boise" field-id="boise" value="boise" checked=${toggle} override-style=${override}></amplify-checkbox>`;
});

checkboxStories.add('disabled', () => {
  const label = knobs.labelKnob('Portland');
  const disabled = knobs.disabledKnob(true);
  const override = knobs.overrideStyleKnob();

  return `<amplify-checkbox label=${label} name="portland" field-id="portland" value="portland" disabled=${disabled} override-style=${override}></amplify-checkbox>`;
});


