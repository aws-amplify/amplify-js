import { storiesOf } from '@storybook/html';
import { text as textKnob } from '@storybook/addon-knobs';

storiesOf('amplify-hint', module).add('with text', () => {
  const text = textKnob('Text', 'Hint placeholder');
  return `<amplify-hint>${text}</amplify-hint>`;
});
