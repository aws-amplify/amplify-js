/*
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import * as React from 'react';
import { autoShowTooltip, tooltip } from '@aws-amplify/ui';

export const Tooltip = (props) => {
	let classes = `${tooltip}`;

	if (props.autoShowTooltip) {
		classes = `${tooltip} ${autoShowTooltip}`;
	}

	return (
		<div className={classes} data-text={props.text}>
			{props.children}
		</div>
	);
};

/**
 * @deprecated use named import
 */
export default Tooltip;
