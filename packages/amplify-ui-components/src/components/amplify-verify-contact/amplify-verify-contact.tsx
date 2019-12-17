import { Auth } from '@aws-amplify/auth';
import { Logger } from '@aws-amplify/core';
import { Component, h, Prop, State } from '@stencil/core';

import { AuthState, AuthStateHandler, CognitoUserInterface } from '../../common/types/auth-types';

const logger = new Logger('amplify-verify-contact');

@Component({
  tag: 'amplify-verify-contact',
  shadow: false,
})
export class AmplifyVerifyContact {
  /** Passed from the Authenticator component in order to change Authentication state */
  @Prop() handleAuthStateChange: AuthStateHandler;
  /** (Optional) Override default styling */
  @Prop() overrideStyle: boolean = false;
  /** Used for the username to be passed to resend code */
  @Prop() user: CognitoUserInterface;
  @State() verifyAttr: any;

  errorMessage(err) {
    if (typeof err === 'string') {
      return err;
    }

    return err.message ? err.message : JSON.stringify(err);
  }

  handleSubmit(event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;

    this.verifyAttr ? this.submit(form.code.value) : this.verify(form.contact.value);
  }

  submit(code) {
    const attr = this.verifyAttr;

    if (!Auth || typeof Auth.verifyCurrentUserAttributeSubmit !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    Auth.verifyCurrentUserAttributeSubmit(attr, code)
      .then(data => {
        logger.debug(data);

        this.handleAuthStateChange(AuthState.SignedIn, this.user);
        this.verifyAttr = null;
      })
      .catch(logger.error);
  }

  verify(contact: 'email' | 'phone') {
    if (!contact) {
      logger.error('Neither Email nor Phone Number selected');
      return;
    }

    if (!Auth || typeof Auth.verifyCurrentUserAttribute !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    Auth.verifyCurrentUserAttribute(contact)
      .then(data => {
        logger.debug(data);
        this.verifyAttr = contact;
      })
      .catch(logger.error);
  }

  render() {
    return (
      <amplify-form-section
        handleSubmit={event => this.handleSubmit(event)}
        headerText="Account recovery requires verified contact information"
        overrideStyle={this.overrideStyle}
        secondaryFooterContent={
          <span>
            <amplify-link onClick={() => this.handleAuthStateChange(AuthState.SignedIn, this.user)}>Skip</amplify-link>
          </span>
        }
        submitButtonText={this.verifyAttr ? 'Submit' : 'Verify'}
      >
        {this.verifyAttr ? this.renderSubmit() : this.renderVerify()}
      </amplify-form-section>
    );
  }

  renderSubmit() {
    return (
      <div>
        <amplify-input
          inputProps={{
            autocomplete: 'off',
          }}
          name="code"
          overrideStyle={this.overrideStyle}
          placeholder="Code"
        />
      </div>
    );
  }

  renderVerify() {
    const user = this.user;

    if (!user) {
      logger.debug('no user for verify');
      return null;
    }

    const { unverified } = user;

    if (!unverified) {
      logger.debug('no unverified on user');
      return null;
    }
    const { email, phone_number } = unverified;

    return (
      <div>
        {email && (
          <amplify-radio-button
            label="Email"
            key="email"
            name="contact"
            overrideStyle={this.overrideStyle}
            value="email"
          />
        )}

        {phone_number && (
          <amplify-radio-button
            label="Phone Number"
            key="phone_number"
            name="contact"
            overrideStyle={this.overrideStyle}
            value="phone_number"
          />
        )}
      </div>
    );
  }
}
