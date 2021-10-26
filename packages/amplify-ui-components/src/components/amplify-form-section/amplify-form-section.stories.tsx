import { storiesOf } from '@storybook/html';
import { knobs } from '../../common/testing';

const formSectionStories = storiesOf('amplify-form-section', module);

formSectionStories.add('default', () => {
	return `<amplify-form-section></amplify-form-section>`;
});

formSectionStories.add('custom text', () => {
	const submitButtonText = knobs.formSectionSubmitKnob('Go');
	const headerText = knobs.formSectionHeaderKnob('Amplify');

	return `<amplify-form-section submit-button-text="${submitButtonText}" header-text="${headerText}"></amplify-form-section>`;
});
