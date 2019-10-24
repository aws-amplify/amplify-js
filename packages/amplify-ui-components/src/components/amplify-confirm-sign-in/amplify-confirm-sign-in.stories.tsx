import { storiesOf } from '@storybook/html';
import { knobs } from '../../common/testing';

const selectStories = storiesOf('amplify-confirm-sign-in', module);

selectStories.add('default', () => {
  const override = knobs.overrideStyleKnob();
  return `<amplify-confirm-sign-in override-style=${override}></amplify-confirm-sign-in>`;
});
