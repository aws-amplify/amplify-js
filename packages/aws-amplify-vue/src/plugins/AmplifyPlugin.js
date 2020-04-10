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
const requiredModules = ['Auth', 'I18n', 'Logger'];

const AmplifyPlugin = {
	install(Vue, AmplifyModules) {
		const missingModules = [];
		requiredModules.forEach(r => {
			if (!Object.keys(AmplifyModules).includes(r)) {
				missingModules.push(r);
			}
		});
		if (missingModules.length > 0) {
			return new Error(
				`AmplifyPlugin installation method did not receive required modules: ${missingModules.join(
					', '
				)}.`
			); //eslint-disable-line
		}

		Vue.prototype.$Amplify = AmplifyModules;
	},
};

export default AmplifyPlugin; //eslint-disable-line
