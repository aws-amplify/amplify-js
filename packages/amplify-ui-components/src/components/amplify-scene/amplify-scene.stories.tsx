import { storiesOf } from '@storybook/html';
// import { knobs } from '../../common/testing';

const amplifySceneStories = storiesOf('amplify-scene', module);

amplifySceneStories.add('default', () => {
  // const label = knobs.labelKnob('Seattle');

  return `<amplify-scene sceneName='test' />`;
});
