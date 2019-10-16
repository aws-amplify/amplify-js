import { FunctionalComponent as FC, h } from '@stencil/core';
import { AmplifyForgotPasswordHintProps } from './amplify-sign-in-interface';
import { AuthStateTunnel } from '../../data/auth-state';

export const AmplifyForgotPasswordHint: FC<AmplifyForgotPasswordHintProps> = ({
  forgotPasswordText,
  resetPasswordText,
}) => (
  <AuthStateTunnel.Consumer>
    {({ onAuthStateChange }) => (
      <div>
        {forgotPasswordText}{' '}
        <amplify-link onClick={() => onAuthStateChange('forgotpassword')}>{resetPasswordText}</amplify-link>
      </div>
    )}
  </AuthStateTunnel.Consumer>
);
