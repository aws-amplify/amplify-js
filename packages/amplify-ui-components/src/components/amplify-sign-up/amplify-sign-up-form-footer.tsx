import { FunctionalComponent as FC, h } from '@stencil/core';
import { AmplifySignUpFormFooterProps } from './amplify-sign-up-interface';
import { signUpFormFooter } from './amplify-sign-up.styles';

export const AmplifySignUpFormFooter: FC<AmplifySignUpFormFooterProps> = ({
  submitButtonText,
  haveAcccountText,
  signInText,
  overrideStyle = false,
  handleAuthStateChange,
}) => (
  <div class={signUpFormFooter}>
    <span>
      {haveAcccountText} <amplify-link onClick={() => handleAuthStateChange('signin')}>{signInText}</amplify-link>
    </span>
    <amplify-button type="submit" overrideStyle={overrideStyle}>
      {submitButtonText}
    </amplify-button>
  </div>
);
