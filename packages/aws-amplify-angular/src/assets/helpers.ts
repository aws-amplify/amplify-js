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

import { AmplifyUIClass, AmplifyUIInterface } from './amplify-angular-theme.class';

/*
  Traverses customCSSClass object and
  1. Moves values from component specific level to top level
  2. Joins string array to string for insertion into class variable
*/
const joinKeys = (customCSS: any, configType: string) => {
  const validFields =  new AmplifyUIClass({});
  const configKeys = Object.keys(customCSS[configType])
    .filter((i) => {
      return validFields.hasOwnProperty(i);
    });
  configKeys.forEach((i) => {
    customCSS[i] = customCSS[configType][i];
  });
  const globalKeys = Object.keys((customCSS))
    .filter((i) => {
      return validFields.hasOwnProperty(i);
    });
  globalKeys.forEach((g) => {
    customCSS[g] = customCSS[g].join(' ');
  });
  delete customCSS[configType];
  return customCSS;
};

const appendCustomClasses = (amplifyUI, customCSS) => {
  const amplifyUIKeys = Object.keys(amplifyUI);
  amplifyUIKeys.forEach((e) => {
    amplifyUI[e] = `${amplifyUI[e]} ${customCSS[e] || ''}`;
  });
  return amplifyUI;
};

export { joinKeys, appendCustomClasses };
