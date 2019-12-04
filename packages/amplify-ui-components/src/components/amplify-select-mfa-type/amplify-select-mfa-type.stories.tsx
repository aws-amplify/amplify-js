import { storiesOf } from '@storybook/html';
import { knobs } from '../../common/testing';

const signOutStories = storiesOf('amplify-sign-out', module);

signOutStories.add('default', () => {
  const override = knobs.overrideStyleKnob();
  return `<amplify-sign-out override-style=${override}></amplify-sign-out>`;
});
