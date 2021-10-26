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

import {
	Component,
	Input,
	ViewEncapsulation,
	Injector,
	ElementRef,
} from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { S3AlbumComponentCore } from './s3-album.component.core';

const template = `
<div class="amplify-album">
  <div class="amplify-album-container">
    <amplify-s3-image-core
      class="amplify-image-container"
      *ngFor="let item of list"
      path="{{item.path}}"
      (selected)="onImageSelected($event)"
    ></amplify-s3-image-core>
  </div>
</div>
`;

@Component({
	selector: 'amplify-s3-album-ionic',
	template,
})
export class S3AlbumComponentIonic extends S3AlbumComponentCore {
	constructor(public amplifyService: AmplifyService) {
		super(amplifyService);
	}
}
