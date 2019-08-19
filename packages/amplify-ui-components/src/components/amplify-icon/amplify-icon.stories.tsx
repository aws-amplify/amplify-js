import { storiesOf } from '@storybook/html';
import { select } from '@storybook/addon-knobs';
import { icons } from './icons';

const amplifyIcon = storiesOf('amplify-icon', module);

amplifyIcon.add('with icon', () => {
  const label = 'Icon Name';
  const iconNames = Object.keys(icons);
  const defaultValue = 'sound-mute';
  
  const name = select(label, iconNames, defaultValue);

  return `<amplify-icon name="${name}"></amplify-icon>`;
});
