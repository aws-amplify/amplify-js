import { h } from '@stencil/core';
import { createProviderConsumer } from '@stencil/state-tunnel';
import { AuthState } from '../components/amplify-authenticator/types';

/**
 * Interface for AuthState to be utilizied across the authenticator
 */
export interface State {
  authState: AuthState;
  onAuthStateChange?: (nextAuthState?: string) => void;
}

/**
 * Creates the initial Provider to use in order to have
 * children, e.g. `Consumer`, be able to use across the 
 * application. First parameter is the Default State passed,
 * in this case the `loading` state. Props contained in the State
 * interface will be passed to the Consumer.
 */
export default createProviderConsumer<State>({
  authState: AuthState.Loading
},
(subscribe, child) => (
  <context-consumer subscribe={subscribe} renderer={child} />
)
);