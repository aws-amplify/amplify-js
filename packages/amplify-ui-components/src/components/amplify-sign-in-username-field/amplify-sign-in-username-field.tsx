import { Component, Prop, h } from '@stencil/core';
import { TextFieldTypes } from '../../common/types';

import Tunnel from '../amplify-authenticator/Tunnel';

@Component({
  tag: 'amplify-sign-in-username-field',
})
export class AmplifySignInUsernameField {
  @Prop() fieldId: string = 'amplify-sign-in-username';
  @Prop() label: string | null = 'Username';
  @Prop() description: string | null = 'Insert your username';
  @Prop() hint: string | null = 'Username hint';
  @Prop() component: Function;
  @Prop() inputProps: {
    type?: TextFieldTypes;
    onChange?: (Event) => void;
  } = {};

  render() {
    return (
      <Tunnel.Consumer>
        {({ handleUsernameChange }) => {
          const inputProps = {
            type: 'text' as TextFieldTypes,
            onChange: handleUsernameChange,
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
