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

const template = `
<div class="amplify-form">
  <div class="form-header">
    <div class="form-title">{{ title }}</div>
  </div>
  <div class="form-body">
    <ng-content select="[form-body]"></ng-content>
  </div>
  <div class="form-footer">
    <ng-content select="[form-footer]"></ng-content>
  </div>
</div>
`;

@Component({
	selector: 'amplify-form',
	template: template,
})
export class FormComponent {
	@Input()
	set title(title: string) {
		this.title = title;
	}
}
