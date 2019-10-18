import { FunctionalComponent as FC, h } from '@stencil/core';
import { AmplifyConfirmSignUpFormFooterProps } from './amplify-confirm-sign-up-interface';
import { confirmSignUpFormFooter } from './amplify-confirm-sign-up.styles';

export const AmplifyConfirmSignUpFormFooter: FC<AmplifyConfirmSignUpFormFooterProps> = ({
  submitButtonText,
  signInText,
  overrideStyle = false,
  onAuthStateChange,
}) => (
  <div class={confirmSignUpFormFooter}>
    <span>
      <amplify-link onClick={() => onAuthStateChange('signin')}>{signInText}</amplify-link>
    </span>
    <amplify-button type="submit" overrideStyle={overrideStyle}>
      {submitButtonText}
    </amplify-button>
  </div>
);
