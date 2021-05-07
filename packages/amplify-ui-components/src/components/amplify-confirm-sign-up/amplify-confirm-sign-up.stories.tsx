import { storiesOf } from '@storybook/html';

const confirmSignUpStories = storiesOf('amplify-confirm-sign-up', module);

confirmSignUpStories.add('default', () => {
	return `<amplify-confirm-sign-up></amplify-confirm-sign-up>`;
});
