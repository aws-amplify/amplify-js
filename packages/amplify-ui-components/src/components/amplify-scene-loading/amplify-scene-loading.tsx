import { Component, Element, Prop, h } from '@stencil/core';
import { loadingOverlay, loadingContainer, loadingLogo, loadingSceneName, sceneErrorText, loadingBar, loadingBarFill } from './amplify-scene-loading.style';

@Component({
  tag: 'amplify-scene-loading',
  shadow: false,
})
export class AmplifySceneLoading {
  @Element() el: HTMLElement;
  @Prop() sceneName: string;
  @Prop() loadPercentage: number = 0;
  @Prop() sceneError: object;

  render() {
    return (
      <div class={loadingOverlay} data-test="sumerianScene.loading">
        <div class={loadingContainer}>
          <div class={loadingLogo}></div>
          <div class={loadingSceneName}>{this.sceneName}</div>
          {this.sceneError
            ? <div class={sceneErrorText}>{this.sceneError}</div>
            : <div class={loadingBar}>
                <div class={loadingBarFill} style={{ width: this.loadPercentage + '%'}} />
              </div> // TODO: Make loading-bar component
          }
        </div>
      </div>
    );
  }
}