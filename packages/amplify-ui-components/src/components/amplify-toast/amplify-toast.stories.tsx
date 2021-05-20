import { storiesOf } from '@storybook/html';

const toastStories = storiesOf('amplify-toast', module);

toastStories.add('default no message', () => {
	return `<amplify-toast></amplify-toast>`;
});

toastStories.add('Error message', () => {
	return `<amplify-toast>Oops! Something has gone wrong. Please try again later</amplify-toast>`;
});
