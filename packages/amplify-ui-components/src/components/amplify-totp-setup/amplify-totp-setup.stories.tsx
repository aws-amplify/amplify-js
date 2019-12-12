import { storiesOf } from '@storybook/html';

const totpStories = storiesOf('amplify-totp', module);

totpStories.add('default', () => {
  return `<amplify-totp></amplify-totp>`;
});
