import { storiesOf } from '@storybook/html';
import { knobs } from '../../common/testing';

storiesOf('amplify-label', module).add('with text', () => {
  const label = knobs.labelKnob('Label text');
  const override = knobs.overrideStyleKnob();
  return `<amplify-label override-style=${override}>${label}</amplify-button>`;
});