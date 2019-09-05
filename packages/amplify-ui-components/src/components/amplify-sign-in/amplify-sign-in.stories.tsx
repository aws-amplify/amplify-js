import { storiesOf } from '@storybook/html';
import { knobs } from '../../common/testing';
import { text as textKnob } from '@storybook/addon-knobs';

const signInStories = storiesOf('amplify-sign-in', module);

signInStories.add('default', () => {
  const override = knobs.overrideStyleKnob();
  const validationErrors = textKnob("Validation Errors", "");
  return `<amplify-sign-in override-style=${override} validation-errors="${validationErrors}"></amplify-sign-in>`;
});
