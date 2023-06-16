// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import listObjectsV2Case from './listObjectsV2';
import putObjectCase from './putObject';

export default [...listObjectsV2Case, ...putObjectCase];
