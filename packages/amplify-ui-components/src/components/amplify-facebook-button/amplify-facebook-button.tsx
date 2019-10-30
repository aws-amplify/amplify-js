import { I18n } from '@aws-amplify/core';
import { Component, h, Prop } from '@stencil/core';

@Component({ tag: 'amplify-facebook-button' })
export class AmplifyFacebookButton {
  /** App-specific client ID from Facebook */
  @Prop() facebook_app_id: string;

  render() {
    return (
      <amplify-sign-in-button provider="facebook">
        <svg slot="icon" viewBox="0 0 279 538" xmlns="http://www.w3.org/2000/svg">
          <g id="Page-1" fill="none" fillRule="evenodd">
            <g id="Artboard" fill="#FFF">
              <path
                d="M82.3409742,538 L82.3409742,292.936652 L0,292.936652 L0,196.990154 L82.2410458,196.990154 L82.2410458,126.4295 C82.2410458,44.575144 132.205229,0 205.252865,0 C240.227794,0 270.306232,2.59855099 279,3.79788222 L279,89.2502322 L228.536175,89.2502322 C188.964542,89.2502322 181.270057,108.139699 181.270057,135.824262 L181.270057,196.89021 L276.202006,196.89021 L263.810888,292.836708 L181.16913,292.836708 L181.16913,538 L82.3409742,538 Z"
                id="Fill-1"
              />
            </g>
          </g>
        </svg>

        {I18n.get('Sign In with Facebook')}
      </amplify-sign-in-button>
    );
  }
}
