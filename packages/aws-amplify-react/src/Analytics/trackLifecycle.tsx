/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { Analytics } from '@aws-amplify/analytics';

const Default_Track_Events = [
	'componentDidMount',
	'componentDidUpdate',
	'compomentWillUnmount',
	'compomentDidCatch',
	'render',
];

export function trackLifecycle(
	Comp,
	trackerName,
	events = Default_Track_Events
) {
	return class WithTrackLifecycle extends React.Component<any, {}> {
		public trackerName: string;
		public trackEvents: string[];

		constructor(props) {
			super(props);
			this.trackerName = trackerName;
			this.trackEvents = events;

			this.track('constructor');
		}

		track(event) {
			const filtered = this.trackEvents.filter((item) => item === event);
			if (filtered.length > 0) {
				if (Analytics && typeof Analytics.record === 'function') {
					Analytics.record({
						name: this.trackerName,
						attributes: { event },
					});
				} else {
					throw new Error(
						'No Analytics module found, please ensure @aws-amplify/analytics is imported'
					);
				}
			}
		}

		componentWillMount() {
			this.track('componentWillMount');
		}

		componentDidMount() {
			this.track('componentDidMount');
		}

		componentWillUnmount() {
			this.track('componentWillUnmount');
		}

		componentDidCatch() {
			this.track('componentDidCatch');
		}

		componentWillReceiveProps() {
			this.track('componentWillReceiveProps');
		}

		shouldComponentUpdate() {
			this.track('shouldComponentUpdate');
			return true;
		}

		componentWillUpdate() {
			this.track('componentWillUpdate');
		}

		componentDidUpdate() {
			this.track('componentDidUpdate');
		}

		setState() {
			this.track('setState');
		}

		forceUpdate() {
			this.track('forceUpdate');
		}

		render() {
			this.track('render');
			return <Comp {...this.props} />;
		}
	};
}
