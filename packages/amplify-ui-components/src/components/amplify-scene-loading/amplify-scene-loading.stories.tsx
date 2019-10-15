import { storiesOf } from '@storybook/html';
import { number, text } from '@storybook/addon-knobs';

const sceneLoadingStories = storiesOf('amplify-scene-loading', module);

sceneLoadingStories.add('default', () => {
  const sceneName = text('sceneName', 'Foo');
  const loadPercentage = number('loadPercentage', '50');

  return `<amplify-scene-loading scene-name=${sceneName} loadPercentage=${loadPercentage} />`;
});
