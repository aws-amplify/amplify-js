import { storiesOf } from '@storybook/html';
import { text as textKnob, boolean as booleanKnob } from '@storybook/addon-knobs';

const checkboxStories = storiesOf('amplify-checkbox', module);

checkboxStories.add('with label', () => {
  const label = textKnob('Label', 'Boise');
  return `<amplify-checkbox label=${label} name="boise" field-id="boise" value="boise"></amplify-checkbox>`;
});

checkboxStories.add('toggle check box', () => {
  const label = textKnob('Label', 'Boise');
  const toggle = booleanKnob('Checkbox toggle', false);
  return `<amplify-checkbox label=${label} name="boise" field-id="boise" value="boise" checked=${toggle}></amplify-checkbox>`;
});

checkboxStories.add('disabled', () => {
  const label = textKnob('Label', 'Portland');
  const toggle = booleanKnob('Disable', true);
  return `<amplify-checkbox label=${label} name="portland" field-id="portland" value="portland" disabled=${toggle}></amplify-checkbox>`;
});


