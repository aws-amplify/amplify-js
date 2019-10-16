import { Component, Prop, h } from '@stencil/core';
import { FormFieldTypes } from '../../components/amplify-auth-fields/amplify-auth-fields-interface';
import {
  SIGN_UP_HEADER_TEXT,
  SIGN_UP_SUBMIT_BUTTON_TEXT,
  HAVE_ACCOUNT_TEXT,
  SIGN_IN_TEXT,
} from '../../common/constants';
import { AmplifySignUpFormFooter } from './amplify-sign-up-form-footer';
import AuthState from '../../data/auth-state';

import { Auth } from '@aws-amplify/auth';

const SIGN_UP_COMPONENTS = [
  {
    type: 'username',
    placeholder: 'Create a username',
    required: true,
  },
  {
    type: 'password',
    placeholder: 'Create a password',
    required: true,
  },
  {
    type: 'email',
    required: true,
  },
  {
    type: 'phone',
    label: 'Phone Number *',
    placeholder: '555-555-5555',
    required: true,
  },
];

@Component({
  tag: 'amplify-sign-up',
  shadow: false,
})
export class AmplifySignUp {
  /** Fires when sign up form is submitted */
  @Prop() handleSubmit: (submitEvent: Event) => void = e => this.signUp(e);
  /** Engages when invalid actions occur, such as missing field, etc. */
  @Prop() validationErrors: string;
  /** Used for header text in sign up component */
  @Prop() headerText: string = SIGN_UP_HEADER_TEXT;
  /** Used for the submit button text in sign up component */
  @Prop() submitButtonText: string = SIGN_UP_SUBMIT_BUTTON_TEXT;
  /** Used for the submit button text in sign up component */
  @Prop() haveAccountText: string = HAVE_ACCOUNT_TEXT;
  /** Used for the submit button text in sign up component */
  @Prop() signInText: string = SIGN_IN_TEXT;
  /** (Optional) Overrides default styling */
  @Prop() overrideStyle: boolean = false;
  /**
   * Form fields allows you to utilize our pre-built components such as username field, code field, password field, email field, etc.
   * by passing an array of strings that you would like the order of the form to be in. If you need more customization, such as changing
   * text for a label or adjust a placeholder, you can follow the structure below in order to do just that.
   * ```
   * [
   *  {
   *    type: 'username'|'password'|'email'|'code'|'default',
   *    label: string,
   *    placeholder: string,
   *    hint: string | Functional Component | null,
   *    required: boolean
   *  }
   * ]
   * ```
   */
  @Prop() formFields: FormFieldTypes | string[] = SIGN_UP_COMPONENTS;

  async signUp(event) {
    //Avoid form submission
    if (event) {
      console.log(event);
      event.preventDefault();
    }

    const username = event.target[0].value;
    const password = event.target[1].value;

    try {
      const user = await Auth.signUp(username, password);
      console.log(user);
    } catch (error) {
      throw new Error(error);
    }
  }

  render() {
    return (
      <AuthState.Consumer>
        {({ onAuthStateChange }) => (
          <amplify-form-section
            headerText={this.headerText}
            overrideStyle={this.overrideStyle}
            handleSubmit={this.handleSubmit}
          >
            <amplify-auth-fields formFields={this.formFields} />
            <div slot="amplify-form-section-footer">
              <AmplifySignUpFormFooter
                submitButtonText={this.submitButtonText}
                haveAcccountText={this.haveAccountText}
                signInText={this.signInText}
                onAuthStateChange={onAuthStateChange}
              />
            </div>
          </amplify-form-section>
        )}
      </AuthState.Consumer>
    );
  }
}
