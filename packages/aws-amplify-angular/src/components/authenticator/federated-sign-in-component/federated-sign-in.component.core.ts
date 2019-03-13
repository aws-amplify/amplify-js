// tslint:disable
/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
import { includes } from '../common';

const template = `
  <div *ngIf="_show">
    <amplify-auth-google-sign-in
      [authState]="_authState"
      [googleClientId]="googleClientId"
    ></amplify-auth-google-sign-in>
  </div>
`

@Component({
  selector: 'amplify-auth-federated-sign-in-core',
  template: template
})
export class FederatedSignInComponentCore {
  _authState: AuthState;
  _show: boolean;
  _federatedSignInConfig: any;
  errorMessage: string;
  amplifyService: AmplifyService;
  googleClientId: string;
  facebookAppId: string;
  amazonClientId: string; 

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
  }

  @Input()
  set data(data: any) {
    this._authState = data.authState
    this._show = includes(['signIn', 'signedOut', 'signedUp'], data.authState.state);

    if (data.federatedSignInConfig) {
      this._federatedSignInConfig = data.federatedSignInConfig;
      if (this._federatedSignInConfig.googleClientId) {
        this.googleClientId = this._federatedSignInConfig.googleClientId
      }
      if (this._federatedSignInConfig.facebookAppId) {
        this.facebookAppId = this._federatedSignInConfig.facebookAppId
      }
      if (this._federatedSignInConfig.amazonClientId) {
        this.amazonClientId = this._federatedSignInConfig.amazonClientId
      }
    }
  }

  @Input()
  set authState(authState: AuthState) {
    this._authState = authState;
    this._show = includes(['signIn', 'signedOut', 'signedUp'], authState.state);
  }

  @Input()
  set federatedSignInConfig(federatedSignInConfig: any) {
    if (federatedSignInConfig) {
      this._federatedSignInConfig = federatedSignInConfig;
      if (this._federatedSignInConfig.googleClientId) {
        this.googleClientId = this._federatedSignInConfig.googleClientId
      }
      if (this._federatedSignInConfig.facebookAppId) {
        this.facebookAppId = this._federatedSignInConfig.facebookAppId
      }
      if (this._federatedSignInConfig.amazonClientId) {
        this.amazonClientId = this._federatedSignInConfig.amazonClientId
      }
    }
  }

  _setError(err: any) {
    if (!err) {
      this.errorMessage = null;
      return;
    }

    this.errorMessage = err.message || err;
  }
}