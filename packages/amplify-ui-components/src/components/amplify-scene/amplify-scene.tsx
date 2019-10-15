import { Component, Prop, State, h } from '@stencil/core';
import { sceneContainer, scene, sceneBar, sceneActions } from './amplify-scene.style';
import { AmplifySceneError } from './amplify-scene-interface';
// import { ConsoleLogger as Logger } from '@aws-amplify/core';
import XR from '@aws-amplify/xr';

const SCENE_CONTAINER_DOM_ID = 'scene-container-dom-id';
const SCENE_DOM_ID = 'scene-dom-id';

// TODO: Add logger after Stencil PR is merged: https://github.com/ionic-team/stencil/pull/1773
// const logger = new Logger('amplify-scene');

@Component({
  tag: 'amplify-scene',
  shadow: false,
})
export class AmplifyScene {
  /* The name of the scene being downloaded and rendered */
  @Prop() sceneName: string;
  /* Whether or not the scene is loading */
  @State() loading: boolean = false;
  /* Value between 0-100 that represents the scene's percentage loaded */
  @State() loadPercentage: number = 0;
  /* Whether or not to show a tooltip to enable audio due to browser security requiring it to be disabled on load*/
  @State() showEnableAudio: boolean = false;
  /* Whether or not the scene volume is muted or not */
  @State() muted: boolean = false;
  /* Whether or not the scene's VR presentation is active */
  @State() isVRPresentationActive: boolean = false;
  /* Scene error object */
  @State() sceneError: AmplifySceneError | null = null;
  /* Whether or not the scene is fullscreen */
  @State() isFullscreen: boolean = false;

  async componentDidLoad() {
    this.listenForFullscreenChange();
    await this.loadAndSetupScene(this.sceneName, SCENE_DOM_ID);
  }

  listenForFullscreenChange() {
    document.onfullscreenchange = () => this.onFullscreenChange();
  }

  async loadAndSetupScene(sceneName, sceneDomId) {
    this.loading = true;
    const sceneOptions = {
      progressCallback: progress => {
        this.loadPercentage = progress * 100;
      },
    };
    try {
      await XR.loadScene(sceneName, sceneDomId, sceneOptions);
    } catch (e) {
      this.sceneError = {
        displayText: 'Failed to load scene',
        error: e,
      };
      return;
    }

    XR.start(sceneName);

    this.muted = XR.isMuted(sceneName);
    this.isVRPresentationActive = XR.isVRPresentationActive(sceneName);
    this.loading = false;

    XR.onSceneEvent(sceneName, 'AudioEnabled', () => (this.showEnableAudio = false));
    XR.onSceneEvent(sceneName, 'AudioDisabled', () => (this.showEnableAudio = true));
  }

  setMuted(muted) {
    if (this.showEnableAudio) {
      XR.enableAudio(this.sceneName);
      this.showEnableAudio = false;
    }

    XR.setMuted(this.sceneName, muted);
    this.muted = muted;
  }

  onFullscreenChange() {
    this.isFullscreen = document.fullscreenElement !== null;
  }

  async minimize() {
    if (document['exitFullscreen']) {
      document['exitFullscreen']();
    } else if (document['mozCancelFullScreen']) {
      document['mozCancelFullScreen']();
    } else if (document['webkitExitFullscreen']) {
      document['webkitExitFullscreen']();
    }
  }

  async maximize() {
    const sceneDomElement = document.getElementById(SCENE_CONTAINER_DOM_ID);
    await sceneDomElement.requestFullscreen();
  }

  toggleVRPresentation() {
    try {
      if (this.isVRPresentationActive) {
        XR.exitVR(this.sceneName);
      } else {
        XR.enterVR(this.sceneName);
      }
    } catch (e) {
      // logger.error('Unable to start/stop WebVR System: ' + e.message);
      return;
    }
    this.isVRPresentationActive = !this.isVRPresentationActive;
  }

  render() {
    let muteButton;
    let enterOrExitVRButton;
    let screenSizeButton;

    if (XR.isSceneLoaded(this.sceneName)) {
      if (this.showEnableAudio) {
        muteButton = (
          <amplify-icon-button
            name="sound-mute"
            tooltip="The scene is muted. Click to unmute."
            onClick={() => this.setMuted(false)}
            autoShowTooltip
          />
        );
      } else if (XR.isMuted(this.sceneName)) {
        muteButton = <amplify-icon-button name="sound-mute" tooltip="Unmute" onClick={() => this.setMuted(false)} />;
      } else {
        muteButton = <amplify-icon-button name="sound" tooltip="Mute" onClick={() => this.setMuted(true)} />;
      }

      if (XR.isVRCapable(this.sceneName)) {
        if (this.isVRPresentationActive) {
          // logger.info('VR Presentation Active');
          enterOrExitVRButton = (
            <amplify-icon-button name="exit-vr" tooltip="Exit VR" onClick={() => this.toggleVRPresentation()} />
          );
        } else {
          // logger.info('VR Presentation Inactive');
          enterOrExitVRButton = (
            <amplify-icon-button name="enter-vr" tooltip="Enter VR" onClick={() => this.toggleVRPresentation()} />
          );
        }
      }

      if (this.isFullscreen) {
        screenSizeButton = (
          <amplify-icon-button name="minimize" tooltip="Exit Fullscreen" onClick={() => this.minimize()} />
        );
      } else {
        screenSizeButton = <amplify-icon-button name="maximize" tooltip="Fullscreen" onClick={() => this.maximize()} />;
      }
    }

    return (
      <div id={SCENE_CONTAINER_DOM_ID} class={sceneContainer}>
        <div id={SCENE_DOM_ID} class={scene}>
          {this.loading ? (
            <amplify-scene-loading
              scene-name={this.sceneName}
              load-percentage={this.loadPercentage}
              scene-error={this.sceneError}
            />
          ) : null}
        </div>

        <div class={sceneBar}>
          <span class={sceneActions}>
            {muteButton}
            {enterOrExitVRButton}
            {screenSizeButton}
          </span>
        </div>
      </div>
    );
  }
}
