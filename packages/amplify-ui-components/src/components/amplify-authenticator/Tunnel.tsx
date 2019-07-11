import { h } from '@stencil/core';
import { createProviderConsumer } from '@stencil/state-tunnel';

export interface State {
  handleUsernameChange?: (Event) => void;
  handlePasswordChange?: (Event) => void;
}

const defaultHandler = () => {
  throw Error('Could not find <amplify-sign-in> component in parent tree.');
};

export default createProviderConsumer<State>(
  {
    handleUsernameChange: defaultHandler,
    handlePasswordChange: defaultHandler,
  },
  (subscribe, child) => <context-consumer subscribe={subscribe} renderer={child} />,
);
