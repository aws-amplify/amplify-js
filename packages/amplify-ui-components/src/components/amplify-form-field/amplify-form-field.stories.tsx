import { storiesOf } from '@storybook/html';
import { knobs } from '../../common/testing';

const formFieldStories = storiesOf('amplify-form-field', module);

formFieldStories.add('generalized', () => {
	const label = knobs.labelKnob('Label placeholder');
	const description = knobs.descriptionKnob('Description placeholder');
	const hint = knobs.hintKnob('Hint placeholder');
	const type = knobs.inputTypeKnob('text');
	const placeholder = knobs.placeholderKnob('Placeholder placeholder');
	return `<amplify-form-field field-id="id" label="${label}" description="${description}" hint="${hint}" type="${type}" placeholder="${placeholder}" />`;
});

formFieldStories.add('password example', () => {
	const label = knobs.labelKnob('Enter your password');
	const description = knobs.descriptionKnob('Passwords should be kept safe!');
	const hint = knobs.hintKnob('Click here to reset your password');
	const type = knobs.inputTypeKnob('password');
	const placeholder = knobs.placeholderKnob('Type here!');
	return `<amplify-form-field field-id="id" label="${label}" description="${description}" hint="${hint}" type="${type}" placeholder="${placeholder}"/>`;
});

formFieldStories.add('number example', () => {
	const label = knobs.labelKnob('Enter in some numbers!');
	const description = knobs.descriptionKnob(
		`Don't you dare try to enter text here`
	);
	const hint = knobs.hintKnob(
		'It turns out you can type e and . in number inputs'
	);
	const type = knobs.inputTypeKnob('number');
	const placeholder = knobs.placeholderKnob('12345');
	return `<amplify-form-field field-id="id" label="${label}" description="${description}" hint="${hint}" type="${type}" placeholder="${placeholder}"/>`;
});
