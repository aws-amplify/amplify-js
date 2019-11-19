import { storiesOf } from '@storybook/html';

const confirmSignUpStories = storiesOf('amplify-require-new-password', module);

confirmSignUpStories.add('default', () => {
  return `<amplify-require-new-password></amplify-require-new-password>`;
});
