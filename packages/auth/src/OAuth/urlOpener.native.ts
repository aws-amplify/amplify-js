// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Linking } from 'react-native';

export const launchUri = url => Linking.openURL(url);
