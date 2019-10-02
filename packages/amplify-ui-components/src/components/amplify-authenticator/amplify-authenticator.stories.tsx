import { storiesOf } from '@storybook/html';

const authenticatorStories = storiesOf('amplify-authenticator', module);

authenticatorStories.add('default', () => {
  return `<amplify-authenticator></amplify-authenticator>`;
});
