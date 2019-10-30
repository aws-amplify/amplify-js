import { I18n } from '@aws-amplify/core';
import { Component, h, Prop } from '@stencil/core';

@Component({ tag: 'amplify-auth0-button' })
export class AmplifyAuth0Button {
  /** See: https://auth0.com/docs/libraries/auth0js/v9#available-parameters */
  @Prop() auth0: any;

  render() {
    return (
      <amplify-sign-in-button provider="auth0">
        <svg slot="icon" id="artwork" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 193.7 216.6">
          <path
            d="M189,66.9L167.2,0H96.8l21.8,66.9H189z M96.8,0H26.5L4.8,66.9h70.4L96.8,0z M4.8,66.9L4.8,66.9	c-13,39.9,1.2,83.6,35.2,108.3l21.7-66.9L4.8,66.9z M189,66.9L189,66.9l-57,41.4l21.7,66.9l0,0C187.7,150.6,201.9,106.8,189,66.9	L189,66.9z M39.9,175.2L39.9,175.2l56.9,41.4l56.9-41.4l-56.9-41.4L39.9,175.2z"
            fill="#FFF"
          />
        </svg>

        {I18n.get('Sign In with Auth0')}
      </amplify-sign-in-button>
    );
  }
}
