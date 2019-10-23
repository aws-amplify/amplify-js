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

const req = require.context('../src/components', true, /.stories.tsx$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
