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
import { I18n } from '@aws-amplify/core';

import { dict } from './AmplifyI18n';

export * from './AmplifyUI';
export * from './Auth';
export * from './Analytics';
export * from './Storage';
export * from './Widget';
export * from './API';
export * from './Interactions';
export * from './XR';

export { Bootstrap as AmplifyTheme } from './AmplifyTheme';
export { MapEntries as AmplifyMessageMapEntries } from './AmplifyMessageMap';
export { transparent1X1, white1X1 } from './AmplifyUI';

I18n.putVocabularies(dict);

console.warn(
	'`aws-amplify-react` has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for more info on Amplify UI.'
);
