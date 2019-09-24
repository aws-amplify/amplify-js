import { FunctionalComponent as FC, h } from '@stencil/core';
import { AmplifyForgotPasswordHintProps } from './amplify-sign-in-interface';

export const AmplifyForgotPasswordHint: FC<AmplifyForgotPasswordHintProps> = ({ forgotPasswordText, resetPasswordText }) => (
  <div>
    {forgotPasswordText} <amplify-link>{resetPasswordText}</amplify-link>
  </div>
);
