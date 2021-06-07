import { storiesOf } from '@storybook/html';

const signUpStories = storiesOf('amplify-sign-up', module);

signUpStories.add('default', () => {
	return `<amplify-sign-up></amplify-sign-up>`;
});
