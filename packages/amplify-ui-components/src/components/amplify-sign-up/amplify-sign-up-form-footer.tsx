import { FunctionalComponent as FC, h } from '@stencil/core';
import { AmplifySignUpFormFooterProps } from './amplify-sign-up-interface';

export const AmplifySignUpFormFooter: FC<AmplifySignUpFormFooterProps> = ({
  submitButtonText,
  haveAcccountText,
  signInText,
  overrideStyle = false,
  handleAuthStateChange,
}) => (
  <div class="sign-up-form-footer">
    <span>
      {haveAcccountText}{' '}
      <amplify-link onClick={() => handleAuthStateChange('signin')} data-test="sign-up-sign-in-link">
        {signInText}
      </amplify-link>
    </span>
    <amplify-button type="submit" overrideStyle={overrideStyle} data-test="sign-up-create-account-button">
      {submitButtonText}
    </amplify-button>
  </div>
);
