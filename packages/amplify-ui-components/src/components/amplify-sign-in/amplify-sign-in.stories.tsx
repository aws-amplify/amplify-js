import { storiesOf } from '@storybook/html';
import { knobs } from '../../common/testing';

const selectStories = storiesOf('amplify-sign-in', module);

selectStories.add('default', () => {
  const override = knobs.overrideStyleKnob();
  return `<amplify-sign-in override-style=${override}></amplify-sign-in>`;
});
