import { Component, h, Prop } from '@stencil/core';

import { SIGN_IN_WITH_AUTH0 } from '../../common/constants';
import { FederatedConfig } from '../../common/types/auth-types';

@Component({
  tag: 'amplify-auth0-button',
  shadow: false,
})
export class AmplifyAuth0Button {
  /** See: https://auth0.com/docs/libraries/auth0js/v9#available-parameters */
  @Prop() config: FederatedConfig['auth0Config'];

  constructor() {
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    event.preventDefault();
  }

  render() {
    return (
      <amplify-sign-in-button onClick={this.handleClick} provider="auth0">
        <script src="https://cdn.auth0.com/js/auth0/9.11/auth0.min.js"></script>
        {SIGN_IN_WITH_AUTH0}
      </amplify-sign-in-button>
    );
  }
}
