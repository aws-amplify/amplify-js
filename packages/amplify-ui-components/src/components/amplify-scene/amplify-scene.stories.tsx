import { storiesOf } from '@storybook/html';

const amplifySceneStories = storiesOf('amplify-scene', module);

amplifySceneStories.add('default', () => {
  return `<amplify-scene sceneName='test' />`;
});
