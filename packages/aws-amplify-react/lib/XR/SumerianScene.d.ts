import * as React from 'react';
interface ISumerianSceneProps {
	sceneName: string;
}
interface ISumerianSceneState {
	showEnableAudio: boolean;
	muted: boolean;
	loading: boolean;
	percentage: number;
	isFullscreen: boolean;
	sceneError: any;
	isVRPresentationActive: boolean;
}
declare class SumerianScene extends React.Component<
	ISumerianSceneProps,
	ISumerianSceneState
> {
	constructor(props: any);
	setStateAsync(state: any): Promise<unknown>;
	componentDidMount(): void;
	componentWillUnmount(): void;
	loadAndSetupScene(sceneName: any, sceneDomId: any): Promise<void>;
	setMuted(muted: any): void;
	onFullscreenChange(): void;
	maximize(): Promise<void>;
	minimize(): Promise<void>;
	toggleVRPresentation(): void;
	render(): JSX.Element;
}
export default SumerianScene;
