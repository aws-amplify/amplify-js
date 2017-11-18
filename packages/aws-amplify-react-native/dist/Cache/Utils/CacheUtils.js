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

export const defaultConfig = {
  keyPrefix: 'aws-amplify-cache',
  capacityInBytes: 1048576, // 1MB
  itemMaxSize: 210000, // about 200kb
  defaultTTL: 259200000, // about 3 days
  defaultPriority: 5,
  warningThreshold: 0.8,
  storage: window.localStorage
};

export function getByteLength(str) {
  let ret = 0;
  ret = str.length;

  for (let i = str.length; i >= 0; i -= 1) {
    const charCode = str.charCodeAt(i);
    if (charCode > 0x7f && charCode <= 0x7ff) {
      ret += 1;
    } else if (charCode > 0x7ff && charCode <= 0xffff) {
      ret += 2;
    }
    // trail surrogate
    if (charCode >= 0xDC00 && charCode <= 0xDFFF) {
      i -= 1;
    }
  }

  return ret;
}

export function getCurrTime() {
  const currTime = new Date();
  return currTime.getTime();
}