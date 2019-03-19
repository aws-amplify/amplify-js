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

import { Component } from '@angular/core';
import { AmplifyService } from '../../../../providers/amplify.service';
import { FacebookSignInComponentCore } from './facebook-sign-in.component.core';

const template = `
  <ion-button 
    expand="block" 
    id={{amplifyUI.facebookSignInButton}} 
    class={{amplifyUI.signInButton}} 
    variant="facebookSignInButton" 
    style="line-height: 16px; --background: #4267B2;"
    (click)="onSignIn()"
  >
    <span class={{amplifyUI.signInButtonIcon}} style="box-sizing: content-box; height: 30px; width: 16px;">
      <svg viewBox='0 0 279 538' xmlns='http://www.w3.org/2000/svg'><g id='Page-1' fill='none' fillRule='evenodd'><g id='Artboard' fill='#FFF'><path d='M82.3409742,538 L82.3409742,292.936652 L0,292.936652 L0,196.990154 L82.2410458,196.990154 L82.2410458,126.4295 C82.2410458,44.575144 132.205229,0 205.252865,0 C240.227794,0 270.306232,2.59855099 279,3.79788222 L279,89.2502322 L228.536175,89.2502322 C188.964542,89.2502322 181.270057,108.139699 181.270057,135.824262 L181.270057,196.89021 L276.202006,196.89021 L263.810888,292.836708 L181.16913,292.836708 L181.16913,538 L82.3409742,538 Z' id='Fill-1' /></g></g></svg>
    </span>
    <span class={{amplifyUI.signInButtonContent}} style="color: var(--color-white);">
        Sign In with Facebook
    </span>
  </ion-button>
`

@Component({
  selector: 'amplify-auth-facebook-sign-in-ionic',
  template
})
export class FacebookSignInComponentIonic extends FacebookSignInComponentCore {

  constructor(protected amplifyService: AmplifyService) {
    super(amplifyService);
  }
}
