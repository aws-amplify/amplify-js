import { storiesOf } from '@storybook/html';
import { text as textKnob } from '@storybook/addon-knobs';

storiesOf('amplify-button', module).add('with text', () => {
  const text = textKnob('Text', 'Foo');
  const primaryColor = textKnob('Primary Color', '#FF9900');
  return `<amplify-button primary-color="${primaryColor}">${text}</amplify-button>`;
});
