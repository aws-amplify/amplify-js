// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { loadGetRandomValues } from '@aws-amplify/react-native';
import { v4 } from 'uuid';

loadGetRandomValues();

const amplifyUuid: () => string = v4;

export { amplifyUuid };
