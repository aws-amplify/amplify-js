import { Auth } from '@aws-amplify/auth';
import { Logger } from '@aws-amplify/core';
import { Component, h, Prop, State } from '@stencil/core';

import { AuthState, AuthStateHandler } from '../../common/types/auth-types';

const logger = new Logger('amplify-verify-contact');

@Component({
  tag: 'amplify-verify-contact',
  shadow: false,
})
export class AmplifyVerifyContact {
  @Prop() authData: any;
  @Prop() authState: AuthState;
  @Prop() onAuthEvent: any;
  @Prop() onStateChange: AuthStateHandler;
  /** (Optional) Override default styling */
  @Prop() overrideStyle: boolean = false;
  @State() verifyAttr: any;

  error(err) {
    this.triggerAuthEvent({
      type: 'error',
      data: this.errorMessage(err),
    });
  }

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

  triggerAuthEvent(event) {
    const state = this.authState;
    if (this.onAuthEvent) {
      this.onAuthEvent(state, event);
    }
  }

  submit(code) {
    const attr = this.verifyAttr;

    if (!Auth || typeof Auth.verifyCurrentUserAttributeSubmit !== 'function') {
      throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    Auth.verifyCurrentUserAttributeSubmit(attr, code)
      .then(data => {
        logger.debug(data);

        this.onStateChange(AuthState.SignedIn, this.authData);
        this.verifyAttr = null;
      })
      .catch(err => this.error(err));
  }

  verify(contact: 'email' | 'phone') {
    if (!contact) {
      this.error('Neither Email nor Phone Number selected');
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
      .catch(err => this.error(err));
  }

  render() {
    if (this.authState !== AuthState.VerifyContact) {
      return null;
    }

    return (
      <amplify-form-section
        handleSubmit={event => this.handleSubmit(event)}
        headerText="Account recovery requires verified contact information"
        overrideStyle={this.overrideStyle}
        secondaryFooterContent={
          <span>
            <amplify-link onClick={() => this.onStateChange(AuthState.SignedIn, this.authData)}>Skip</amplify-link>
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
    const user = this.authData;

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
