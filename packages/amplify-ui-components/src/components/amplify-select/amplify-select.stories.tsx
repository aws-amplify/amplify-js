import { storiesOf } from '@storybook/html';

const selectStories = storiesOf('amplify-select', module);

selectStories.add('default with country dial codes', () => {
  return `<amplify-select></amplify-select>`;
});
