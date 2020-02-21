import { storiesOf } from '@storybook/html';
import { knobs } from '../../common/testing';

const confirmSignInStories = storiesOf('amplify-confirm-sign-in', module);

confirmSignInStories.add('default', () => {
  return `<amplify-confirm-sign-in override-style=${override}></amplify-confirm-sign-in>`;
});
