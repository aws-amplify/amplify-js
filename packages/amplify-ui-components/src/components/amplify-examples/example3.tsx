import { h } from '@stencil/core';

const CustomSignIn = ({ handleSubmit }) => (
  <form onSubmit={handleSubmit}>
    <fieldset>
      <legend>Custom Login</legend>
      <div>
        <strong>Form header content here</strong>
      </div>
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
