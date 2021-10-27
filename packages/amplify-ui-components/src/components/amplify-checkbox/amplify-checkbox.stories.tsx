import { storiesOf } from '@storybook/html';
import { knobs } from '../../common/testing';

const checkboxStories = storiesOf('amplify-checkbox', module);

checkboxStories.add('with label', () => {
	const label = knobs.labelKnob('Boise');

	return `<amplify-checkbox label=${label} name="boise" field-id="boise" value="boise"></amplify-checkbox>`;
});

checkboxStories.add('toggle check box', () => {
	const label = knobs.labelKnob('Boise');
	const toggle = knobs.toggleKnob(false);

	return `<amplify-checkbox label=${label} name="boise" field-id="boise" value="boise" checked=${toggle}></amplify-checkbox>`;
});

checkboxStories.add('disabled', () => {
	const label = knobs.labelKnob('Portland');
	const disabled = knobs.disabledKnob(true);

	return `<amplify-checkbox label=${label} name="portland" field-id="portland" value="portland" disabled=${disabled}></amplify-checkbox>`;
});
