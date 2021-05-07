import { storiesOf } from '@storybook/html';
import { knobs } from '../../common/testing';

const hintStories = storiesOf('amplify-hint', module);

hintStories.add('with text', () => {
	const text = knobs.hintKnob('Hint placeholder');
	return `<amplify-hint>${text}</amplify-hint>`;
});
