import { storiesOf } from '@storybook/html';

const totpSetupStories = storiesOf('amplify-totp-setup', module);

totpSetupStories.add('default', () => {
	return `<amplify-totp-setup></amplify-totp-setup>`;
});
