import { FunctionalComponent as FC, h } from '@stencil/core';
import { AmplifyForgotPasswordHintProps } from './amplify-sign-in-interface';

export const AmplifyForgotPasswordHint: FC<AmplifyForgotPasswordHintProps> = ({ forgotPasswordText, resetPasswordText, onAuthStateChange }) => (
  <div>
    {forgotPasswordText} <amplify-link onClick={() => onAuthStateChange('forgotpassword')}>{resetPasswordText}</amplify-link>
  </div>
);
