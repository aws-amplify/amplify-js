import { storiesOf } from '@storybook/html';
import { knobs } from '../../common/testing';
import { select } from '@storybook/addon-knobs';
import { icons } from '../amplify-icon/icons';

const buttonStories = storiesOf('amplify-icon-button', module);

buttonStories.add('with sound icon', () => {
  const override = knobs.overrideStyleKnob();

  const label = 'Icon Name';
  const iconNames = Object.keys(icons);
  const defaultValue = 'sound';

  const name = select(label, iconNames, defaultValue);

  return `<amplify-icon-button name=${name} override-style=${override} />`;
});
