/*
 * Copyright 2017-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';

import { AppMessage, Notifications } from '@aws-amplify/notifications';

export const InAppMessagingContext = createContext(null);

export const InAppMessagingProvider = ({ children }) => {
	const [messages, setMessages] = useState([]);

	const eventValidatedHandler = (messages: AppMessage[]) => {
		setMessages(messages);
	};

	useEffect(() => {
		Notifications.setMessageValidatedHandler(eventValidatedHandler);
	});

	const clearMessages = useCallback(() => {
		setMessages([]);
	}, []);

	return (
		<InAppMessagingContext.Provider value={{ messages, clearMessages }}>
			{children}
		</InAppMessagingContext.Provider>
	);
};

export const useInAppMessages = () => useContext(InAppMessagingContext);
