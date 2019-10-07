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

/*
  This plugin is a mechanism for avoiding the importation of Amplify into Amplify-Vue,
  while also making Amplify available to the entire host application.
*/

import Amplify from '@aws-amplify/core';
import { PluginObject, VueConstructor } from 'vue';
const requiredModules = ['Auth', 'AuthClass', 'I18n', 'Logger'];

const AmplifyPlugin: PluginObject<Amplify> = {
  install(Vue: VueConstructor, AmplifyModules?: Amplify) {
    const missingModules: string[] = [];
    const availableModules = Object.keys(AmplifyModules || {});
    requiredModules.forEach(r => {
      if (!availableModules.includes(r)) {
        missingModules.push(r);
      }
    });
    if (missingModules.length > 0) {
      const label =
        'AmplifyPlugin installation method did not receive required modules';
      return new Error(`${label}: ${missingModules.join(', ')}.`);
    }

    Vue.prototype.$Amplify = AmplifyModules;
  },
};

export default AmplifyPlugin;
