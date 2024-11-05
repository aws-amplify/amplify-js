// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Platform } from 'react-native';

// General
export const PACKAGE_NAME = '@aws-amplify/rtn-web-browser';
export const LINKING_ERROR =
	`The ${PACKAGE_NAME} package doesn't seem to be linked. Make sure: \n\n` +
	Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
	'- You rebuilt the app after installing the package\n' +
	'- You are not using Expo Go\n';
