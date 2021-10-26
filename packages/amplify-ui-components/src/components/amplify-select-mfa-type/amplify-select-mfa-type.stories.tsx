import { storiesOf } from '@storybook/html';

const selectMfaTypeStories = storiesOf('amplify-select-mfa-type', module);

selectMfaTypeStories.add('default', () => {
	return `<amplify-select-mfa-type />`;
});
