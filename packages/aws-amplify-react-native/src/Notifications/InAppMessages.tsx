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
	// ComponentType,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
// import { Linking, StyleSheet, View } from 'react-native';

import { AppMessage, Notifications } from '@aws-amplify/notifications';

// interface InAppMessageProps<T> {
// 	components: Record<'Banner' | 'Carousel' | 'FullScreen', ComponentType<T>>;
// 	messages: AppMessage[];
// 	clearMessages: any;
// 	validator?: (data?: any) => boolean;
// 	callback?: any;
// }

// export function InAppMessage({
// 	clearMessages,
// 	components,
// 	messages,
// }: InAppMessageProps<{
// 	inAppMessage: AppMessage['InAppMessage'];
// 	onButtonPress: (event: any) => void;
// 	onNotificationClose: () => void;
// }>) {
// 	const onButtonPress = async buttonConfig => {
// 		try {
// 			const action = buttonConfig.ButtonAction;
// 			if (action === 'LINK' || action === 'DEEP_LINK') {
// 				const url = buttonConfig.Link;
// 				const supported = await Linking.canOpenURL(url);
// 				if (supported) {
// 					await Linking.openURL(url);
// 				} else {
// 					console.log("Can't open URL");
// 				}
// 			}
// 		} catch (e) {
// 			console.log(e);
// 		} finally {
// 			clearMessages();
// 		}
// 	};

// 	const handleMessages = () => {
// 		const { InAppMessage } = messages.length && messages[0];
// 		if (!InAppMessage) {
// 			return null;
// 		}
// 		const { Banner, Carousel, FullScreen } = components;

// 		switch (InAppMessage.Layout) {
// 			case 'TOP_BANNER':
// 			case 'MIDDLE_BANNER':
// 			case 'BOTTOM_BANNER':
// 				return (
// 					<Banner
// 						inAppMessage={InAppMessage}
// 						onButtonPress={onButtonPress}
// 						onNotificationClose={clearMessages}
// 					/>
// 				);
// 			case 'OVERLAYS':
// 				return (
// 					<FullScreen
// 						inAppMessage={InAppMessage}
// 						onButtonPress={onButtonPress}
// 						onNotificationClose={clearMessages}
// 					/>
// 				);
// 			case 'CAROUSEL':
// 				return (
// 					<Carousel
// 						inAppMessage={InAppMessage}
// 						onButtonPress={onButtonPress}
// 						onNotificationClose={clearMessages}
// 					/>
// 				);
// 			default:
// 				return null;
// 		}
// 	};

// 	return handleMessages();
// }

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
