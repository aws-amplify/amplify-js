// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// import { PlatformNotSupportedError } from '@aws-amplify/core/internals/utils';

import { getIsPasskeySupported as rtnGetIsPasskeySupported } from '@aws-amplify/react-native';

export const getIsPasskeySupported = () => rtnGetIsPasskeySupported();
