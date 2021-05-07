/* eslint-disable */
/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { browserOrNode } from '@aws-amplify/core';

if (browserOrNode().isBrowser) {
	let customStyles = document.createElement('style');
	customStyles.appendChild(
		document.createTextNode(`
    :root {
      /* Typography */
      --amplify-font-family: 'Amazon Ember', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;

      --amplify-text-xxs: 0.75rem;
      --amplify-text-xs: 0.81rem;
      --amplify-text-sm: 0.875rem;
      --amplify-text-md: 1rem;
      --amplify-text-md-sub: 1.15rem;
      --amplify-text-lg: 1.5rem;
      --amplify-text-xl: 2rem;
      --amplify-text-xxl: 2.5rem;

      /* Colors */
      --amplify-primary-color: #ff9900;
      --amplify-primary-contrast: var(--amplify-white);
      --amplify-primary-tint: #ffac31;
      --amplify-primary-shade: #e88b01;

      --amplify-secondary-color: #152939;
      --amplify-secondary-contrast: var(--amplify-white);
      --amplify-secondary-tint: #31465f;
      --amplify-secondary-shade: #1F2A37;

      --amplify-tertiary-color: #5d8aff;
      --amplify-tertiary-contrast: var(--amplify-white);
      --amplify-tertiary-tint: #7da1ff;
      --amplify-tertiary-shade: #537BE5;

      --amplify-background-color: var(--amplify-white);

      /* Neutral */
      --amplify-grey: #828282;
      --amplify-light-grey: #c4c4c4;
      --amplify-white: #ffffff;
      --amplify-smoke-white: #f5f5f5;
      --amplify-red: #dd3f5b;
      --amplify-blue: #099ac8;
    }
  `)
	);

	let parentElement = document.getElementsByTagName('head')[0];
	const firstChild = parentElement.firstChild;
	parentElement.insertBefore(customStyles, firstChild);
}
