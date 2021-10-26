import { storiesOf } from '@storybook/html';

const confirmSignInStories = storiesOf('amplify-confirm-sign-in', module);

confirmSignInStories.add('default', () => {
	return `<amplify-confirm-sign-in></amplify-confirm-sign-in>`;
});
