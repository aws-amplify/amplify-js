import { storiesOf } from '@storybook/html';

const coutnryDialCodeStories = storiesOf('amplify-country-dial-code', module);

coutnryDialCodeStories.add(
	'default with country dial code select options',
	() => {
		return `<amplify-country-dial-code></amplify-country-dial-code>`;
	}
);
