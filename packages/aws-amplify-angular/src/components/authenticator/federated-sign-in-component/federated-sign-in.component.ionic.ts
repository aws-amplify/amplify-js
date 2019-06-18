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
import { FederatedSignInComponentCore } from './federated-sign-in.component.core';

const template = `
<div>
  <amplify-auth-google-sign-in-ionic
    *ngIf="googleClientId"
    [googleClientId]="googleClientId"
  ></amplify-auth-google-sign-in-ionic>

  <amplify-auth-facebook-sign-in-ionic
    *ngIf="facebookAppId"
    [facebookAppId]="facebookAppId"
  ></amplify-auth-facebook-sign-in-ionic>

  <amplify-auth-amazon-sign-in-ionic
    *ngIf="amazonClientId"
    [amazonClientId]="amazonClientId"
  ></amplify-auth-amazon-sign-in-ionic>
</div>
`

@Component({
  selector: 'amplify-auth-federated-sign-in-ionic',
  template: template
})
export class FederatedSignInComponentIonic extends FederatedSignInComponentCore {

  constructor(amplifyService: AmplifyService) {
    super(amplifyService);
  }
}
