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
  <div>
    <amplify-auth-google-sign-in-core
      *ngIf="googleClientId"
      [googleClientId]="googleClientId"
    ></amplify-auth-google-sign-in-core>

    <amplify-auth-facebook-sign-in-core
      *ngIf="facebookAppId"
      [facebookAppId]="facebookAppId"
    ></amplify-auth-facebook-sign-in-core>

    <amplify-auth-amazon-sign-in-core
      *ngIf="amazonClientId"
      [amazonClientId]="amazonClientId"
    ></amplify-auth-amazon-sign-in-core>
  </div>
`;

@Component({
  selector: 'amplify-auth-federated-sign-in-core',
  template
})
export class FederatedSignInComponentCore {
  _authState: AuthState;
  _show: boolean;
  _federatedSignInConfig: any;
  googleClientId: string;
  facebookAppId: string;
  amazonClientId: string; 

  constructor(protected amplifyService: AmplifyService) {}

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
        this.googleClientId = this._federatedSignInConfig.googleClientId;
      }
      if (this._federatedSignInConfig.facebookAppId) {
        this.facebookAppId = this._federatedSignInConfig.facebookAppId;
      }
      if (this._federatedSignInConfig.amazonClientId) {
        this.amazonClientId = this._federatedSignInConfig.amazonClientId;
      }
    }
  }
}
