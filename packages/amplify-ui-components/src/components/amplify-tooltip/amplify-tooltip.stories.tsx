import { storiesOf } from '@storybook/html';
import { knobs } from '../../common/testing';

const tooltipStories = storiesOf('amplify-tooltip', module);

tooltipStories.add('with text', () => {
	const text = knobs.buttonTextKnob('Foo');
	const autoShow = knobs.tooltipAutoShowKnob(true);
	return `<div style="margin-bottom:60px"></div> <amplify-tooltip text="${text}" should-auto-show=${autoShow}><amplify-button}>Tooltip test</amplify-button></amplify-tooltip>`;
});
