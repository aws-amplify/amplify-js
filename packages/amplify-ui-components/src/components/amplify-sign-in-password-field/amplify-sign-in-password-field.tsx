import { Component, Prop, h } from '@stencil/core';

import Tunnel from '../amplify-authenticator/Tunnel';

@Component({
  tag: 'amplify-sign-in-password-field',
})
export class AmplifySignInPasswordField {
  @Prop() fieldId: string = 'amplify-sign-in-password';
  @Prop() label: string | null = 'Password';
  @Prop() description: string | null = 'Insert your password';
  @Prop() hint: string | null = 'Password hint';
  @Prop() component: Function;
  @Prop() inputProps: {
    type?: string;
    onChange?: (Event) => void;
  } = {};

  render() {
    return (
      <Tunnel.Consumer>
        {({ handlePasswordChange }) => {
          const inputProps = {
            type: 'password',
            onChange: handlePasswordChange,
            ...this.inputProps,
          };

          const props = {
            fieldId: this.fieldId,
            label: this.label,
            description: this.description,
            hint: this.hint,
            inputProps: inputProps,
          };

          if (this.component) {
            return this.component(props);
          }

          return <amplify-form-field {...props} />;
        }}
      </Tunnel.Consumer>
    );
  }
}
