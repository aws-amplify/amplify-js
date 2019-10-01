import { h } from '@stencil/core';

const CustomPasswordField = ({ inputProps }) => (
  <div>
    <p>
      <strong>
        <label htmlFor="my-custom-password-field">This is a custom password field</label>
      </strong>
    </p>
    <p>
      <i>
        some extra content here and maybe a <a href="javascript:void(0);">link to documentation</a>
      </i>
    </p>
    <input id="my-custom-password-field" placeholder="Type your password" {...inputProps} />
  </div>
);

const CustomSignIn = ({ handleSubmit }) => (
  <form onSubmit={handleSubmit}>
    <fieldset>
      <legend>Custom Login</legend>
      <div>
        <strong>Form header content here</strong>
      </div>
      <p>
        <amplify-sign-in-username-field
          fieldId="custom-sign-in-username"
          label="Custom username field"
          description="insert your username"
        />
      </p>
      <p>
        <amplify-sign-in-password-field component={props => <CustomPasswordField {...props} />} />
      </p>
    </fieldset>
    <div>
      <a href="javascript:void(0)">Custom link here</a> <amplify-button type="submit">Submit</amplify-button>
    </div>
  </form>
);

const Example3 = () => (
  <div>
    <amplify-authenticator
      signIn={props => <CustomSignIn {...props} />}
      content={() => (
        <div>
          <p>
            <strong>My app with custom login!</strong>
          </p>
          <p>Some app content here</p>
        </div>
      )}
    />
  </div>
);

export default {
  title: 'Authenticator with custom sign-in form',
  Content: Example3,
};
