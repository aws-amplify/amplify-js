// tslint:disable:max-line-length
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

import { NgModule , forwardRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { S3AlbumComponentCore } from './components/storage/s3-album-component/s3-album.component.core';
import { S3ImageComponentCore } from './components/storage/s3-image-component/s3-image.component.core';
import { PhotoPickerComponentCore } from './components/storage/photo-picker-component/photo-picker.component.core';
// tslint:enable:max-line-length

const components = [
  S3AlbumComponentCore,
  S3ImageComponentCore,
  PhotoPickerComponentCore
];

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ...components,
  ],
  entryComponents: [
    ...components
  ],
  providers: [ ],
  exports: [
    ...components,
  ]
})
export class AmplifyAngularStorageModule { }
