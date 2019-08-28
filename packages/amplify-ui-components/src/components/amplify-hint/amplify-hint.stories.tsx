import { storiesOf } from '@storybook/html';
import { knobs } from '../../common/testing';

storiesOf('amplify-hint', module).add('with text', () => {
  const text = knobs.hintKnob('Hint placeholder');
  const override = knobs.overrideStyleKnob();
  return `<amplify-hint override-style=${override}>${text}</amplify-hint>`;
});
