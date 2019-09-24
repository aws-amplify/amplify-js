import { FunctionalComponent as FC, h } from '@stencil/core';
import { AmplifySignInFormFooterProps } from './amplify-sign-in-interface';
import { signInFormFooter } from './amplify-sign-in.styles';

export const AmplifySignInFormFooter: FC<AmplifySignInFormFooterProps> = ({ submitButtonText, noAccountText, createAccountText, overrideStyle = false }) => (
  <div class={signInFormFooter}>
    <span>{noAccountText} <amplify-link>{createAccountText}</amplify-link></span>
    <amplify-button type="submit" overrideStyle={overrideStyle}>{submitButtonText}</amplify-button>
  </div>
);
