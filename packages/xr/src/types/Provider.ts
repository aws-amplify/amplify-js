// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SceneOptions } from './XR';

export interface XRProvider {
	// configure your provider
	configure(config: object): object;

	// return 'XR';
	getCategory(): string;

	// return the name of you provider
	getProviderName(): string;

	loadScene(
		sceneName: string,
		domElementId: string,
		sceneOptions: SceneOptions
	);
	isSceneLoaded(sceneName): boolean;
	getSceneController(sceneName: string): any;
	isVRCapable(sceneName: string): boolean;
	isVRPresentationActive(sceneName: string): boolean;
	start(sceneName: string): void;
	enterVR(sceneName: string): void;
	exitVR(sceneName: string): void;
	isMuted(sceneName: string): boolean;
	setMuted(sceneName: string, muted: boolean): void;
	onSceneEvent(
		sceneName: string,
		eventName: string,
		eventHandler: Function
	): void;
	enableAudio(sceneName: string): void;
}
