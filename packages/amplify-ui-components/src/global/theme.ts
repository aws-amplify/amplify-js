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

    /* Typography */
    --amplify-font-family: 'Amazon Ember', 'Helvetica Neue Light', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif';

    --amplify-text-xxs: 0.75rem;
    --amplify-text-xs: 0.81rem;
    --amplify-text-sm: 0.875rem;
    --amplify-text-md: 1rem;
    --amplify-text-lg: 1.5rem;
    --amplify-text-xl: 2rem;
    --amplify-text-xxl: 2.5rem;

    /* Colors */
    --amplify-amazon-orange: #ff9900;
    --amplify-light-amazon-orange: #ffac31;
    --amplify-dark-amazon-orange: #e88b01;

    --amplify-light-squid-ink: #31465f;
    --amplify-deep-squid-ink: #152939;
    --amplify-dark-squid-ink: #1F2A37;


    /* Neutral */
    --amplify-grey: #828282;
    --amplify-light-grey: #c4c4c4;
    --amplify-white: #ffffff;

    --amplify-dark-blue: #31465f;
    --amplify-light-blue: #00a1c9; 
    --amplify-red: #dd3f5b;

    --amplify-primary-color: var(--amplify-amazon-orange);
    --amplify-primary-contrast: var(--amplify-white);
    --amplify-primary-shade: var(--amplify-light-amazon-orange);
    --amplify-primary-tint: var(--amplify-dark-amazon-orange); 

    --amplify-secondary-color: var(--amplify-deep-squid-ink);
    --amplify-secondary-contrast: var(--amplify-white);
    --amplify-secondary-shade: var(--amplify-light-squid-ink);
    --amplify-secondary-tint: var(--amplify-dark-squid-ink); 

    --amplify-tertiary-color: #5d8aff;
    --amplify-tertiary-contrast: var(--amplify-white);
    --amplify-tertiary-shade: #7da1ff;
    --amplify-tertiary-tint: #537BE5;

    /* Breakpoints */
    --breakpointSm: 320px;
    --breakpointMd: 672px;
    --breakpointLg: 1056px;
    --breakpointXl: 1321px;
    --breakpointMax: 1584px;


    /* Theme */
    /* All of the variables below can be used within any application that does an @import inside of their application */

  }
`;
