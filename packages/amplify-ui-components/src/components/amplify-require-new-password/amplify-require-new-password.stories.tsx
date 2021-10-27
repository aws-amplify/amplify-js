import { storiesOf } from '@storybook/html';

const requireNewPasswordStories = storiesOf(
	'amplify-require-new-password',
	module
);

requireNewPasswordStories.add('default', () => {
	return `<amplify-require-new-password></amplify-require-new-password>`;
});
