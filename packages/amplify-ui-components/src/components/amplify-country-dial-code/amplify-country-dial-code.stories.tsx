import { storiesOf } from '@storybook/html';
import { knobs } from '../../common/testing';

const coutnryDialCodeStories = storiesOf('amplify-country-dial-code', module);

coutnryDialCodeStories.add('default with country dial code select options', () => {
  const override = knobs.overrideStyleKnob();
  return `<amplify-country-dial-code override-style=${override}></amplify-country-dial-code>`;
});
