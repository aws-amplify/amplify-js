// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadUrlPolyfill } from '@aws-amplify/react-native';

loadUrlPolyfill();

const AmplifyUrl = URL;
const AmplifyUrlSearchParams = URLSearchParams;

export { AmplifyUrl, AmplifyUrlSearchParams };
