// tslint:disable
/*
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
// tslint:enable

import { Component, Input, OnInit  } from '@angular/core';
import { AmplifyService } from '../../../../providers/amplify.service';
import { constants, setLocalStorage } from '../../common'
import * as AmplifyUI from '@aws-amplify/ui';

const template = `
  <button id={{amplifyUI.googleSignInButton}} class={{amplifyUI.signInButton}} variant="googleSignInButton" (click)="onSignIn()">
    <span class={{amplifyUI.signInButtonIcon}}>
      <svg viewBox="0 0 256 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"/><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"/><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"/><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"/></svg>
    </span>
    <span class={{amplifyUI.signInButtonContent}} style="color: var(--color-white);">
     Sign In with Google
    </span>
  </button>
`

@Component({
  selector: 'amplify-auth-google-sign-in-core',
  template
})
export class GoogleSignInComponentCore implements OnInit {
  @Input() googleClientId: string;
  protected logger: any;
  amplifyUI: any;

  constructor(protected amplifyService: AmplifyService) {
    this.logger = this.amplifyService.logger('GoogleSignInComponent', 'INFO');
    this.amplifyUI = AmplifyUI
  }

  ngOnInit() {
    if (!this.amplifyService.auth() || 
      typeof this.amplifyService.auth().federatedSignIn !== 'function' || 
      typeof this.amplifyService.auth().currentAuthenticatedUser !== 'function') {
      this.logger.warn('No Auth module found, please ensure @aws-amplify/auth is imported');
    }

    const ga = (<any>window).gapi && (<any>window).gapi.auth2 
      ? (<any>window).gapi.auth2.getAuthInstance() 
      : null;
    if (this.googleClientId && !ga) {
      this.createScript();
    }
  }

  async onSignIn() {
    const ga = (<any>window).gapi.auth2.getAuthInstance();
    try {
      const googleUser = await ga.signIn()
      const { id_token, expires_at } = googleUser.getAuthResponse();
      const profile = googleUser.getBasicProfile();
      const gapiUser = {
        email: profile.getEmail(),
        name: profile.getName(),
        picture: profile.getImageUrl(),
      };

      const payload = { provider: constants.GOOGLE };
      setLocalStorage(constants.AUTH_SOURCE_KEY, payload, this.logger);

      await this.amplifyService.auth().federatedSignIn('google', {
        token: id_token,
        expires_at
      }, gapiUser);
      this.logger.debug(`Signed in with federated identity: ${constants.GOOGLE}`);
      
      const user = await this.amplifyService.auth().currentAuthenticatedUser();
      this.amplifyService.setAuthState({ state: 'signedIn', user: user});
    } catch(error) {
      this.logger.error(error);
    }
  }

  initGapi() {
    this.logger.debug('init gapi');
    const ga = (<any>window).gapi;
    const self = this;
    ga.load('auth2', () => {
        ga.auth2.init({
            client_id: self.googleClientId,
            scope: 'profile email openid'
        });
    });
  }

  createScript() {
    const script = document.createElement('script');
  
    script.src = 'https://apis.google.com/js/platform.js';
    script.async = true;
    script.onload = this.initGapi.bind(this)
    document.body.appendChild(script);
  }
}
