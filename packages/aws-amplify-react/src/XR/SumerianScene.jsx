import React, { Component } from 'react';
import XR from '@aws-amplify/xr';

import IconButton from './IconButton';
import Loading from './Loading';
import * as AmplifyUI from '@aws-amplify/ui';

const SCENE_DOM_ID = 'scene-dom-id';

class SumerianScene extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showEnableAudio: false,
      muted: false,
      loading: true,
      percentage: 0
    };
  }

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve)
    });
  }

  componentDidMount() {
    this.loadAndSetupScene(this.props.sceneName, SCENE_DOM_ID)
  }
  
  async loadAndSetupScene(sceneName, sceneDomId) {
    this.setStateAsync({ loading: true });
    const sceneOptions = { 
      progressCallback: (progress) => {
        const percentage = progress * 100;
        this.setState({ percentage });
      }
    };
    await XR.loadScene(sceneName, sceneDomId, sceneOptions);
    XR.start(sceneName);

    this.setStateAsync({ 
      muted: XR.isMuted(sceneName),
      loading: false
    });

    XR.onSceneEvent(sceneName, 'AudioEnabled', () => this.setStateAsync({showEnableAudio: false}));
    XR.onSceneEvent(sceneName, 'AudioDisabled', () => this.setStateAsync({showEnableAudio: true}));
  }
  
  setMuted(muted) {
    if (this.state.showEnableAudio) {
      XR.enableAudio(this.props.sceneName);
      this.setState({showEnableAudio: false});
    }

    XR.setMuted(this.props.sceneName, muted);
    this.setState({ muted: muted });
  }

  async maximize() {
    const sceneDomElement = document.getElementById(SCENE_DOM_ID);
    await sceneDomElement.requestFullScreen();
  }
  

  render() {
    let muteButton;
    let enterVRButton;
    let maximizeButton;

    if (XR.isSceneLoaded(this.props.sceneName)) {
      if (this.state.showEnableAudio) {
        muteButton = <IconButton variant="sound-mute" tooltip="The scene is muted. Click to unmute." onClick={() => this.setMuted(false)} autoShowTooltip />
      } else if (XR.isMuted(this.props.sceneName)) {
        muteButton = <IconButton variant="sound-mute" tooltip="Unmute" onClick={() => this.setMuted(false)} />
      } else {
        muteButton = <IconButton variant="sound" tooltip="Mute" onClick={() => this.setMuted(true)} />
      }

      if (XR.isVRCapable(this.props.sceneName)) {
        enterVRButton = <IconButton variant="enter-vr" tooltip="Enter VR" onClick={() => XR.enterVR(this.props.sceneName)} />
      }
      maximizeButton = <IconButton variant="maximize" tooltip="Fullscreen" onClick={() => this.maximize()} />
    }

    return (
      <div className={AmplifyUI.sumerianSceneContainer}>
        <div id={SCENE_DOM_ID} className={AmplifyUI.sumerianScene}>
          {this.state.loading && <Loading sceneName={this.props.sceneName} percentage={this.state.percentage} />}
        </div>
        <div className={AmplifyUI.sceneBar}>
          <span className={AmplifyUI.sceneActions}>
            {muteButton}
            {enterVRButton}
            {maximizeButton}
          </span>
        </div>
      </div>
    );
  }
}

export default SumerianScene;
