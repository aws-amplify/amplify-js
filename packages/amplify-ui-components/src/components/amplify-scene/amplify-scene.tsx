// import { Component, Element, Prop, State, h } from '@stencil/core';
// import { sceneContainer, scene, sceneActions, sceneBar } from './amplify-scene.style';

// import Auth from '@aws-amplify/auth';
// import XR from '@aws-amplify/xr';
// import aws_exports from './aws-exports';

// Auth.configure(aws_exports);
// XR.configure(aws_exports);

// const SCENE_CONTAINER_DOM_ID = 'scene-container-dom-id';
// const SCENE_DOM_ID = 'scene-dom-id';

// @Component({
//   tag: 'amplify-scene',
//   shadow: false,
// })
// export class AmplifyScene {
//   @Element() el: HTMLElement;
//   @Prop() sceneName: string;

//   @State() loading: boolean;
//   @State() loadPercentage: number;
//   @State() showEnableAudio: boolean;
//   @State() muted: boolean;
//   @State() isVRPresentationActive: boolean;
//   @State() sceneError: object;

//   async componentDidLoad() {
//     await this.loadAndSetupScene("scene1", SCENE_DOM_ID);
//   }

//   async loadAndSetupScene(sceneName, sceneDomId) {
//     this.loading = true;
//     const sceneOptions = {
//       progressCallback: (progress) => {
//         this.loadPercentage = progress * 100;
//       }
//     };
//     try {
//       await XR.loadScene(sceneName, sceneDomId, sceneOptions);
//     } catch (e) {
//       this.sceneError = {
//         displayText: 'Failed to load scene',
//         error: e
//       }
//       return;
//     }

//     XR.start(sceneName);

//     this.muted = XR.isMuted(sceneName);
//     this.isVRPresentationActive = XR.isVRPresentationActive(sceneName);
//     this.loading = false;

//     XR.onSceneEvent(sceneName, 'AudioEnabled', () => this.showEnableAudio = false);
//     XR.onSceneEvent(sceneName, 'AudioDisabled', () => this.showEnableAudio = true);
//   }

//   render() {
//     return (
//       <div id={SCENE_CONTAINER_DOM_ID} class={sceneContainer}>
//         <div id={SCENE_DOM_ID} class={scene}>
//           {this.loading
//             ? <amplify-scene-loading scene-name={this.sceneName} load-percentage={this.loadPercentage} scene-error={this.sceneError} />
//             : null
//           }
//         </div>

//         <div class={sceneBar}>
//           <span class={sceneActions}>
//             {/* <icon-button type="mute" /> */}
//             {/* <icon-button type="enterVr" /> */}
//             {/* <icon-button type="screenSize" /> */}

//             {/* {muteButton}
//             {enterOrExitVRButton}
//             {screenSizeButton} */}
//           </span>
//         </div>
//       </div>
//     );
//   }
// }
