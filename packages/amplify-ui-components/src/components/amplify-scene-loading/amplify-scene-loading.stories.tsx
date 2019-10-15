import { storiesOf } from '@storybook/html';
import { number, text } from '@storybook/addon-knobs';

const sceneLoadingStories = storiesOf('amplify-scene-loading', module);

sceneLoadingStories.add('default', () => {
  const sceneName = text('sceneName', 'Foo');
  const label = 'Load Percentage';
  const defaultValue = 50;
  const options = {
    range: true,
    min: 0,
    max: 100,
    step: 1,
  };
  const loadPercentage = number(label, defaultValue, options);

  return `<amplify-scene-loading scene-name=${sceneName} load-percentage=${loadPercentage} />`;
});
