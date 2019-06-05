import { Component, Element, Prop, h } from '@stencil/core';
import { css } from 'emotion';

import AWS from 'aws-sdk';
import { Auth } from 'aws-amplify';

const sceneContainer = css`
  background-color: blue;
`;

const scene = css`
  background-color: blue;
`;

const SCENE_CONTAINER_DOM_ID = 'scene-container-dom-id';
const SCENE_DOM_ID = 'scene-dom-id';

@Component({
  tag: 'amplify-scene',
  shadow: false,
})
export class AmplifyScene {
  @Element() el: HTMLElement;

  @Prop() sceneName: string;

  async componentDidLoad() {
    AWS.Amplify;
    Auth.currentUserPoolUser();
    await this.loadAndSetupScene("classroom", SCENE_DOM_ID);
  }

  async loadAndSetupScene(sceneName, sceneDomId) {
    console.log(sceneName);
    console.log(sceneDomId);

    // await XR.loadScene(sceneName, sceneDomId);
    // XR.start(sceneName);
    // this.setStateAsync({ loading: true });
    // const sceneOptions = { 
      // progressCallback: (progress) => {
      //   // const percentage = progress * 100;
      //   // this.setState({ percentage });
      // }
    // };
    try {
      // await XR.loadScene(sceneName, sceneDomId, sceneOptions);
    } catch (e) {
      // const sceneError = {
      //   displayText: 'Failed to load scene',
      //   error: e
      // }
      // logger.error(sceneError.displayText, sceneError.error);
      // this.setStateAsync({sceneError});
      return;
    }
    
    // XR.start(sceneName);

    // this.setStateAsync({ 
    //   muted: XR.isMuted(sceneName),
    //   isVRPresentationActive: XR.isVRPresentationActive(sceneName),
    //   loading: false
    // });

    // XR.onSceneEvent(sceneName, 'AudioEnabled', () => this.setStateAsync({showEnableAudio: false}));
    // XR.onSceneEvent(sceneName, 'AudioDisabled', () => this.setStateAsync({showEnableAudio: true}));
  }

  render() {
    return (
      <div id={SCENE_CONTAINER_DOM_ID} class={sceneContainer}>
        <div id={SCENE_DOM_ID} class={scene}>
          {/* {this.state.loading && <Loading sceneName={this.props.sceneName} percentage={this.state.percentage} sceneError={this.state.sceneError}/>} */}
        </div>
        {/* <div className={AmplifyUI.sceneBar}>
          <span className={AmplifyUI.sceneActions}>
            {muteButton}
            {enterOrExitVRButton}
            {screenSizeButton}
          </span>
        </div> */}
      </div>
    );
  }
}