// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

//@ts-ignore -> module imported from RN
import { Linking } from 'react-native';

export const launchUri = (url:string) => Linking.openURL(url);
