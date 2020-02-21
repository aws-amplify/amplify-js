import { storiesOf } from '@storybook/html';
import { knobs } from '../../common/testing';

const hintStories = storiesOf('amplify-hint', module);

hintStories.add('with text', () => {
  const text = knobs.hintKnob('Hint placeholder');
  return `<amplify-hint override-style=${override}>${text}</amplify-hint>`;
});
