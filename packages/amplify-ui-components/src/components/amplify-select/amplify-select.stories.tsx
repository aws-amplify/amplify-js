import { storiesOf } from '@storybook/html';
import { knobs } from '../../common/testing';

const selectStories = storiesOf('amplify-select', module);

selectStories.add('default with empty select', () => {
  const override = knobs.overrideStyleKnob();
  return `<amplify-select override-style=${override}></amplify-select>`;
});
