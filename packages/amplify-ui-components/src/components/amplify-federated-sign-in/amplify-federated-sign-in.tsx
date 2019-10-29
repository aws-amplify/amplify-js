import { Auth } from '@aws-amplify/auth';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

const logger = new Logger('amplify-federated-sign-in');

@Component({
  tag: 'amplify-federated-sign-in',
  shadow: false,
})
export class AmplifyFederatedSignIn {
  /** The current authentication state. */
  @Prop() authState: 'signIn' | 'signedOut' | 'signedUp' = 'signIn';
  /** Federated credentials & configuration. */
  @Prop() federated: any = {};
  /** Listener when `authState` changes */
  @Event() stateChange: EventEmitter;

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
    if (!this.federated) {
      logger.debug('federated prop is empty. show nothing');
      logger.debug('federated={google_client_id: , facebook_app_id: , amazon_client_id}');

      return null;
    }

    if (!['signIn', 'signedOut', 'signedUp'].includes(this.authState)) {
      return null;
    }

    logger.debug('federated Config is', this.federated);

    return (
      <amplify-form-section data-test="federated-sign-in-section">
        <amplify-section data-test="federated-sign-in-body-section">
          <amplify-federated-buttons
            authState={this.authState}
            data-test="federated-sign-in-buttons"
            federated={this.federated}
          />
        </amplify-section>
      </amplify-form-section>
    );
  }
}
