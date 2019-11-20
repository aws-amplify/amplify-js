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

module.exports = {
	css: {
		modules: true,
		/*
      ! IMPORTANT !
      If css.extract is true (which it is by default),
      then vue cli build system will extract <style>s into css files
      which end users would then need to manually import.
      So... leave css.extract set to false.
    */
		extract: false,
	},
};
