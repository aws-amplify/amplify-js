import { storiesOf } from '@storybook/html';

const selectStories = storiesOf('amplify-select', module);

selectStories.add('default with empty select', () => {
	return `<amplify-select></amplify-select>`;
});
