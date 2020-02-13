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
import { injectGlobal } from 'emotion';

injectGlobal`
   :root {
    /* Colors */
    --amplify-amazon-orange: #ff9900;
    --amplify-light-amazon-orange: #ffac31;
    --amplify-dark-amazon-orange: #e88b01;
    --amplify-squid-ink: #232f3e;
    --amplify-light-squid-ink: #31465f;
    --amplify-deep-squid-ink: #152939;
    --amplify-grey: #828282;
    --amplify-light-grey: #c4c4c4;
    --amplify-silver: #e1e4ea;
    --amplify-dark-blue: #31465f;
    --amplify-red: #dd3f5b;
    --amplify-white: #ffffff;
    --amplify-light-blue: #00a1c9;
    --amplify-yellow-warning: #f8d047;
    --amplify-red-problem: #cc1454;
    /* Theme */
    /* All of the variables below can be used within any application that does an @import inside of their application */
    --amplify-button-color: var(--amplify-white);
    --amplify-button-background-color: var(--amplify-amazon-orange);
    --amplify-button-background-color-danger: var(--amplify-color-danger);
    --amplify-button-click: var(--amplify-dark-amazon-orange);
    --amplify-section-background-color: var(--amplify-white);
    --amplify-section-header-color: var(--amplify-deep-squid-ink);
    --amplify-label-color: var(--amplify-deep-squid-ink);
    --amplify-link-color: var(--amplify-amazon-orange);
    --amplify-hint-color: var(--amplify-grey);
    --amplify-form-color: var(--amplify-white);
    --amplify-input-color: var(--amplify-deep-squid-ink);
    --amplify-input-background-color: var(--amplify-white);
    --amplify-input-border-color: var(--amplify-light-grey);
    --amplify-primary-font-size: 1em;
    --amplify-secondary-font-size: 0.875em;
    --amplify-third-font-size: 0.813em;
    --amplify-font-family: 'Amazon Ember', 'Helvetica Neue Light', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif';
  }
`; 