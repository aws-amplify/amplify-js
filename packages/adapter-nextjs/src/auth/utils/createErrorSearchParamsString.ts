// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const createErrorSearchParamsString = <
	T1 extends string | null,
	T2 extends string | null,
	R = T1 extends string ? string : T2 extends string ? string : undefined,
>({
	error,
	errorDescription,
}: {
	error: T1;
	errorDescription: T2;
}): R => {
	const errorParams = new URLSearchParams();

	if (error) {
		errorParams.set('error', error);
	}

	if (errorDescription) {
		errorParams.set('error_description', errorDescription);
	}

	return (errorParams.toString() || undefined) as R;
};
