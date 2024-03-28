// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type InAppMessageLayout =
	| 'BOTTOM_BANNER'
	| 'CAROUSEL'
	| 'FULL_SCREEN'
	| 'MIDDLE_BANNER'
	| 'MODAL'
	| 'TOP_BANNER';

export type InAppMessageAction = 'CLOSE' | 'DEEP_LINK' | 'LINK';

export type InAppMessageTextAlign = 'center' | 'left' | 'right';

export type ButtonConfigPlatform = 'Android' | 'IOS' | 'Web' | 'DefaultConfig';

interface InAppMessageContainer {
	style?: InAppMessageStyle;
}

interface InAppMessageHeader {
	content: string;
	style?: InAppMessageStyle;
}

interface InAppMessageBody {
	content: string;
	style?: InAppMessageStyle;
}

export interface InAppMessageImage {
	src: string;
}

export interface InAppMessageButton {
	title: string;
	action: InAppMessageAction;
	url?: string;
	style?: InAppMessageStyle;
}

export interface InAppMessageStyle {
	backgroundColor?: string;
	borderRadius?: number;
	color?: string;
	textAlign?: InAppMessageTextAlign;
}

export interface InAppMessageContent {
	container?: InAppMessageContainer;
	header?: InAppMessageHeader;
	body?: InAppMessageBody;
	image?: InAppMessageImage;
	primaryButton?: InAppMessageButton;
	secondaryButton?: InAppMessageButton;
}

export interface InAppMessage {
	id: string;
	layout: InAppMessageLayout;
	content: InAppMessageContent[];
	metadata?: any;
}
