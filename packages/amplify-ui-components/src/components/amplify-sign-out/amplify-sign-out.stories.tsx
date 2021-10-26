import { storiesOf } from '@storybook/html';

const signOutStories = storiesOf('amplify-sign-out', module);

signOutStories.add('default', () => {
	return `<amplify-sign-out></amplify-sign-out>`;
});
