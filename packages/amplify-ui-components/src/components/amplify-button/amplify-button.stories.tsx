import { storiesOf } from '@storybook/html';
import { text as textKnob } from '@storybook/addon-knobs';

storiesOf('amplify-button', module).add('with text', () => {
  const text = textKnob('Text', 'Foo');
  const type = textKnob('Type', 'button');
  return `<amplify-button type=${type}>${text}</amplify-button>`;
});
