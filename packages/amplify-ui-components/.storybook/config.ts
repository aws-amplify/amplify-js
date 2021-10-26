import { configure, addDecorator } from '@storybook/html';
import { withKnobs } from '@storybook/addon-knobs';
import { withA11y } from '@storybook/addon-a11y';
import { setConsoleOptions } from '@storybook/addon-console';

addDecorator((storyFn, context) => {
	setConsoleOptions({
		log: `${context.kind}/${context.story}`,
		warn: `${context.kind}/${context.story}/warn`,
		error: `${context.kind}/${context.story}/error`,
	});

	return storyFn(context);
});

addDecorator(withKnobs);
addDecorator(withA11y);

configure(require.context('../src/components', true, /.stories.tsx$/), module);

if (module.hot) {
	// Listening for `dispose` indicates when a build has taken place so that
	// we can reload the iframe `window` with changes from stencil's build process.
	// (`module.hot.accept` will refresh the sidebar as well, since `req.id`).
	module.hot.dispose(() => {
		window.history.pushState(null, null, window.location.href);
		window.location.reload();
	});
}
