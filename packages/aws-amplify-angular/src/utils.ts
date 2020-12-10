// tslint:disable
/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
// tslint:enable
import { HubCapsule, Hub } from '@aws-amplify/core';
import { Observable } from 'rxjs';

/**
 * Enables usage of Hub as an RXJS operator
 * Example usage:
 *
 * fromHub('Auth', 'customOAuthState').subscribe((capsule: HubCapsule) => {
 * 	console.log(capsule.payload.data);
 * });
 * @param channel Hub channel
 * @param eventName Event in hub channel you want to subscribe to
 */
export function fromHub(
	channel: string,
	eventName: string
): Observable<HubCapsule> {
	return new Observable<HubCapsule>(subscriber => {
		function listener(data: HubCapsule) {
			switch (data.payload.event) {
				case eventName:
					subscriber.next(data);
					break;
			}
		}
		Hub.listen(channel, listener);

		return () => Hub.remove(channel, listener);
	});
}
