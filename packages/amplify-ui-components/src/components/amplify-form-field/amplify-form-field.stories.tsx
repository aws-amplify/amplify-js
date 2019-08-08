import { storiesOf } from '@storybook/html';
import { text as textKnob } from '@storybook/addon-knobs';

storiesOf('amplify-form-field', module).add('with knobs', () => {
  const label = textKnob('Label', 'Label placeholder');
  const description = textKnob('Description', 'Description placeholder');
  const type = textKnob('Type', 'text');
  return `<amplify-form-field field-id="id" label="${label}" description="${description}" type="${type}"/>`;
});

storiesOf('amplify-form-field', module).add('password example', () => {
  return `<amplify-form-field field-id="id" label="Enter your password" description="Passwords should be kept safe!" type="password"/>`;
});
