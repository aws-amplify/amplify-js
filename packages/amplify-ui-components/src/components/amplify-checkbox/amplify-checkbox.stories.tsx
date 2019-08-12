import { storiesOf } from '@storybook/html';
import { text as textKnob } from '@storybook/addon-knobs';

const checkboxStories = storiesOf('amplify-checkbox', module);

checkboxStories.add('with label', () => {
  const label = textKnob('Label', 'Boise');
  return `<amplify-checkbox label=${label}></amplify-checkbox>`;
});
