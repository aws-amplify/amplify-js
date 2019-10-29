import { Auth } from '@aws-amplify/auth';
import { isEmpty, I18n } from '@aws-amplify/core';
import { Component, h, Prop } from '@stencil/core';

@Component({ tag: 'amplify-federated-buttons' })
export class AmplifyFederatedButtons {
  /** The current authentication state. */
  @Prop() authState: 'signIn' | 'signedOut' | 'signedUp' = 'signIn';
  /** Federated credentials & configuration. */
  @Prop() federated: any = {};

  componentWillLoad() {
    if (!Auth || typeof Auth.configure !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    const { oauth = {} } = Auth.configure({});

    // backward compatibility
    if (oauth['domain']) {
      this.federated.oauth_config = { ...this.federated.oauth_config, ...oauth };
    } else if (oauth['awsCognito']) {
      this.federated.oauth_config = { ...this.federated.oauth_config, ...oauth['awsCognito'] };
    }

    if (oauth['auth0']) {
      this.federated.auth0 = { ...this.federated.auth0, ...oauth['auth0'] };
    }
  }

  render() {
    if (!['signIn', 'signedOut', 'signedUp'].includes(this.authState)) {
      return null;
    }

    if (isEmpty(this.federated)) {
      return null;
    }

    const { amazon_client_id, auth0, facebook_app_id, google_client_id, oauth_config } = this.federated;

    return (
      <div>
        {google_client_id && (
          <div>
            <amplify-google-button google_client_id={google_client_id} />
          </div>
        )}

        {facebook_app_id && (
          <div>
            <amplify-facebook-button facebook_app_id={facebook_app_id} />
          </div>
        )}

        {amazon_client_id && (
          <div>
            <amplify-amazon-button amazon_client_id={amazon_client_id} />
          </div>
        )}

        {oauth_config && (
          <div>
            <amplify-oauth-button oauth_config={oauth_config} />
          </div>
        )}

        {auth0 && (
          <div>
            <amplify-auth0-button auth0={auth0} />
          </div>
        )}

        <amplify-strike>{I18n.get('or')}</amplify-strike>
      </div>
    );
  }
}
