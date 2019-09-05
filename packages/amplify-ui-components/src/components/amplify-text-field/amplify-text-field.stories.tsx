import { storiesOf } from '@storybook/html';
import { text as textKnob } from '@storybook/addon-knobs';

const textFieldStories = storiesOf('amplify-text-field', module);

textFieldStories.add('with text', () => {
  const label = textKnob('Label', 'Label placeholder');
  const description = textKnob('Description', 'Description placeholder');
  return `<amplify-text-field fieldId="id" label="${label}" description="${description}"/>`;
});
