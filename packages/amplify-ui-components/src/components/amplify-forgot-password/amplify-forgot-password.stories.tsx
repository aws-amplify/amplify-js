import { storiesOf } from '@storybook/html';

const forgotPasswordStories = storiesOf('amplify-forgot-password', module);

forgotPasswordStories.add('default', () => {
	return `<amplify-forgot-password></amplify-forgot-password>`;
});
