// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { MFAType } from "../../../types/models";

export type FetchMFAPreferenceRequest = {
	enabled?: MFAType[];
	preferred?: MFAType;
};
