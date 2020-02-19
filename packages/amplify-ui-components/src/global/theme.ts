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

    --amplify-primary-font-size: 1em;
    --amplify-secondary-font-size: 0.875em;
    --amplify-third-font-size: 0.813em;

    --amplify-text-xs:;
    --amplify-text-sm:;
    --amplify-text-md:;
    --amplify-text-lg:;
    --amplify-text-xl:;
    --amplify-text-xxl:;


    /* Colors */
    --amplify-amazon-orange: #ff9900;
    --amplify-light-amazon-orange: #ffac31;
    --amplify-dark-amazon-orange: #e88b01;
    --amplify-light-squid-ink: #31465f;
    --amplify-deep-squid-ink: #152939;
    --amplify-grey: #828282;
    --amplify-light-grey: #c4c4c4;
    --amplify-white: #ffffff;
    --amplify-dark-blue: #31465f;
    --amplify-light-blue: #00a1c9; 
    --amplify-red: #dd3f5b;

    /* Space Scale */

    /* Breakpoints */
    --breakpointSm: 480px;
    --breakpointMd: 768px;
    --breakpointLg: 1024px;
    --breakpointXl: 1280px;


    /* Theme */
    /* All of the variables below can be used within any application that does an @import inside of their application */

  }
`;
