import { FunctionalComponent as FC, h } from '@stencil/core';
import { AmplifyConfirmSignUpFormFooterProps } from './amplify-confirm-sign-up-interface';
import { confirmSignUpFormFooter } from './amplify-confirm-sign-up.styles';
import { AuthState } from '../../common/types/auth-types';

export const AmplifyConfirmSignUpFormFooter: FC<AmplifyConfirmSignUpFormFooterProps> = ({
  submitButtonText,
  signInText,
  overrideStyle = false,
  handleAuthStateChange,
}) => (
  <div class={confirmSignUpFormFooter}>
    <span>
      <amplify-link onClick={() => handleAuthStateChange(AuthState.SignIn)}>{signInText}</amplify-link>
    </span>
    <amplify-button type="submit" overrideStyle={overrideStyle}>
      {submitButtonText}
    </amplify-button>
  </div>
);
