import { storiesOf } from '@storybook/html';
import { knobs } from '../../common/testing';

storiesOf('amplify-button', module).add('with text', () => {
  const text = knobs.buttonTextKnob('Foo');
  const type = knobs.buttonTypeKnob('button');
  const override = knobs.overrideStyleKnob();
  return `<amplify-button type=${type} override-style=${override}>${text}</amplify-button>`;
});
