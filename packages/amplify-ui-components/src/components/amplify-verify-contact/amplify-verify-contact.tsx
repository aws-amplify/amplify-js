import { Auth } from '@aws-amplify/auth';
import { I18n, Logger } from '@aws-amplify/core';
import { Component, h, Prop, State } from '@stencil/core';
import { AuthState, AuthStateHandler, CognitoUserInterface } from '../../common/types/auth-types';
import { NO_AUTH_MODULE_FOUND } from '../../common/constants';
import { dispatchAuthStateChangeEvent } from '../../common/helpers';
import { Translations } from '../../common/Translations';

const logger = new Logger('AmplifyVerifyContact');

@Component({
  tag: 'amplify-verify-contact',
  shadow: true,
})
export class AmplifyVerifyContact {
  /** Passed from the Authenticator component in order to change Authentication state */
  @Prop() handleAuthStateChange: AuthStateHandler = dispatchAuthStateChangeEvent;
  /** Used for the username to be passed to resend code */
  @Prop() user: CognitoUserInterface;

  @State() verifyAttr: any;
  @State() loading: boolean = false;

  handleSubmit(event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;

    this.verifyAttr ? this.submit(form.code.value) : this.verify(form.contact.value);
  }

  async submit(code) {
    const attr = this.verifyAttr;

    if (!Auth || typeof Auth.verifyCurrentUserAttributeSubmit !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }

    try {
      const data = await Auth.verifyCurrentUserAttributeSubmit(attr, code);

      logger.debug(data);
      this.handleAuthStateChange(AuthState.SignedIn, this.user);
      this.verifyAttr = null;
    } catch (error) {
      logger.error(error);
    }
  }

  async verify(contact: keyof CognitoUserInterface['unverified']) {
    if (!contact) {
      logger.error('Neither Email nor Phone Number selected');
      return;
    }

    if (!Auth || typeof Auth.verifyCurrentUserAttribute !== 'function') {
      throw new Error(NO_AUTH_MODULE_FOUND);
    }

    this.loading = true;
    try {
      const data = await Auth.verifyCurrentUserAttribute(contact);

      logger.debug(data);
      this.verifyAttr = contact;
    } catch (error) {
      logger.error(error);
    } finally {
      this.loading = false;
    }
  }

  renderSubmit() {
    return (
      <div>
        <amplify-input
          inputProps={{
            autocomplete: 'off',
          }}
          name="code"
          placeholder={I18n.get(Translations.CODE_PLACEHOLDER)}
        />
      </div>
    );
  }

  renderVerify() {
    const user = this.user;

    if (!user) {
      logger.debug('No user to verify');
      return null;
    }

    const { unverified } = user;

    if (!unverified) {
      logger.debug('Unverified variable does not exist on user');
      return null;
    }
    const { email, phone_number } = unverified;

    return (
      <div>
        {email && (
          <amplify-radio-button
            label={I18n.get(Translations.VERIFY_CONTACT_EMAIL_LABEL)}
            key="email"
            name="contact"
            value="email"
          />
        )}

        {phone_number && (
          <amplify-radio-button
            label={I18n.get(Translations.VERIFY_CONTACT_PHONE_LABEL)}
            key="phone_number"
            name="contact"
            value="phone_number"
          />
        )}
      </div>
    );
  }

  render() {
    return (
      <amplify-form-section
        handleSubmit={event => this.handleSubmit(event)}
        headerText={I18n.get(Translations.VERIFY_CONTACT_HEADER_TEXT)}
        loading={this.loading}
        secondaryFooterContent={
          <span>
            <amplify-button
              variant="anchor"
              onClick={() => this.handleAuthStateChange(AuthState.SignedIn, this.user)}
            >
              Skip
            </amplify-button>
          </span>
        }
        submitButtonText={
          this.verifyAttr
            ? I18n.get(Translations.VERIFY_CONTACT_SUBMIT_LABEL)
            : I18n.get(Translations.VERIFY_CONTACT_VERIFY_LABEL)
        }
      >
        {this.verifyAttr ? this.renderSubmit() : this.renderVerify()}
      </amplify-form-section>
    );
  }
}
