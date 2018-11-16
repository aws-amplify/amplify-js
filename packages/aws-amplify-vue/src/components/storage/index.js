/* eslint-disable */
/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
/* eslint-enable */

import Vue from 'vue';

import PhotoPicker from './PhotoPicker.vue';
import S3Album from './S3Album.vue';
import S3Image from './S3Image.vue';


Vue.component('amplify-photo-picker', PhotoPicker);
Vue.component('amplify-s3-album', S3Album);
Vue.component('amplify-s3-image', S3Image);

export {
  PhotoPicker,
  S3Album,
  S3Image,
};
