import { FunctionalComponent as FC, h } from '@stencil/core';
import { AmplifyForgotPasswordHintProps } from './amplify-sign-in-interface';
import AuthState from '../../data/auth-state';

export const AmplifyForgotPasswordHint: FC<AmplifyForgotPasswordHintProps> = ({ forgotPasswordText, resetPasswordText }) => (
  <AuthState.Consumer>
    {({ onAuthStateChange }) => (
      <div>
        {forgotPasswordText} <amplify-link onClick={() => onAuthStateChange('forgotpassword')}>{resetPasswordText}</amplify-link>
      </div>
    )}
  </AuthState.Consumer>
);
