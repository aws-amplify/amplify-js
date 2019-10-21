import { FunctionalComponent as FC, h } from '@stencil/core';
import { AmplifyConfirmSignUpHintProps } from './amplify-confirm-sign-up-interface';

export const AmplifyConfirmSignUpHint: FC<AmplifyConfirmSignUpHintProps> = ({
  forgotCodeText,
  resendCodeText,
  resendConfirmCode,
}) => (
  <div>
    {forgotCodeText} <amplify-link onClick={() => resendConfirmCode()}>{resendCodeText}</amplify-link>
  </div>
);
