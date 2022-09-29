/*
 * Copyright 2017-2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

// as a safeguard against known React Native lineHeight issues, e.g. https://github.com/facebook/react-native/issues/29507
// use a value of 1.5 as the default line height multiplier
const LINE_HEIGHT_MULTIPLIER = 1.5;

export const getLineHeight = (fontSize: number) => fontSize * LINE_HEIGHT_MULTIPLIER;
