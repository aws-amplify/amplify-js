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

amplifyIcon.add('with two icons', () => {
	const label = 'Icon Name';
	const iconNames = Object.keys(icons);
	const defaultValue = 'sound-mute';

	const name1 = select(label, iconNames, defaultValue);
	const name2 = select('test', ['sound-mute', 'sound'], 'sound');

	return `<div><amplify-icon name="${name1}"></amplify-icon><amplify-icon name="${name2}"></amplify-icon></div>`;
});
