import { storiesOf } from '@storybook/html';
import { knobs } from '../../common/testing';

const buttonStories = storiesOf('amplify-button', module);

buttonStories.add('with text', () => {
	const text = knobs.buttonTextKnob('Foo');
	const type = knobs.buttonTypeKnob('button');
	return `<amplify-button type=${type}>${text}</amplify-button>`;
});
