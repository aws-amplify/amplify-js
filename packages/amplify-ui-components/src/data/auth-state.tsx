import { h } from '@stencil/core';
import { createProviderConsumer } from '@stencil/state-tunnel';
import { AuthState } from '../components/amplify-authenticator/types';

export interface State {
  authState: AuthState;
  onAuthStateChange?: (stateOfAuth?: string, authState?: string) => void;
}

export default createProviderConsumer<State>({
  authState: AuthState.Loading
},
(subscribe, child) => (
  <context-consumer subscribe={subscribe} renderer={child} />
)
);