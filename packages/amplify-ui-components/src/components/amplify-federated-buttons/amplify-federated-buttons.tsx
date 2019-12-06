import { Auth } from '@aws-amplify/auth';
import { isEmpty } from '@aws-amplify/core';
import { Component, h, Prop } from '@stencil/core';

import { NO_AUTH_MODULE_FOUND } from '../../common/constants';
import { AuthState, FederatedConfig, AuthStateHandler } from '../../common/types/auth-types';

@Component({
  tag: 'amplify-federated-buttons',
  shadow: false,
})
export class AmplifyFederatedButtons {
  /** The current authentication state. */
  @Prop() authState: AuthState = AuthState.SignIn;
  /** Federated credentials & configuration. */
  @Prop() federated: FederatedConfig = {};
  /** Passed from the Authenticator component in order to change Authentication state
   * e.g. SignIn -> 'Create Account' link -> SignUp
   */
  @Prop() handleAuthStateChange: AuthStateHandler;
  /** (Optional) Override default styling */
  @Prop() overrideStyle: boolean = false;

  componentWillLoad() {
    if (!Auth || typeof Auth.configure !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }

    const { oauth = {} } = Auth.configure({});

    // backward compatibility
    if (oauth['domain']) {
      this.federated.oauthConfig = { ...this.federated.oauthConfig, ...oauth };
    } else if (oauth['awsCognito']) {
      this.federated.oauthConfig = { ...this.federated.oauthConfig, ...oauth['awsCognito'] };
    }

    if (oauth['auth0']) {
      this.federated.auth0Config = { ...this.federated.auth0Config, ...oauth['auth0'] };
    }
  }

  render() {
    if (!Object.values(AuthState).includes(this.authState)) {
      return null;
    }

    if (isEmpty(this.federated)) {
      return null;
    }

    const { amazonClientId, auth0Config, facebookAppId, googleClientId, oauthConfig } = this.federated;

    return (
      <div>
        {googleClientId && (
          <div>
            <amplify-google-button
              clientId={googleClientId}
              handleAuthStateChange={this.handleAuthStateChange}
              overrideStyle={this.overrideStyle}
            />
          </div>
        )}

        {facebookAppId && (
          <div>
            <amplify-facebook-button appId={facebookAppId} overrideStyle={this.overrideStyle} />
          </div>
        )}

        {amazonClientId && (
          <div>
            <amplify-amazon-button clientId={amazonClientId} overrideStyle={this.overrideStyle} />
          </div>
        )}

        {oauthConfig && (
          <div>
            <amplify-oauth-button config={oauthConfig} overrideStyle={this.overrideStyle} />
          </div>
        )}

        {auth0Config && (
          <div>
            <amplify-auth0-button config={auth0Config} overrideStyle={this.overrideStyle} />
          </div>
        )}
      </div>
    );
  }
}
