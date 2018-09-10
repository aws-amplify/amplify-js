import { AbstractXRProvider } from './XRProvider';
import { ProviderOptions, SceneConfiguration } from '../types';

type SumerianSceneConfiguration = SceneConfiguration & { url: string, isSigv4: boolean, sceneId: string };

export class SumerianProvider extends AbstractXRProvider {
  constructor(options: ProviderOptions = {}) {
      super(options);
  }

  getProviderName() { return 'SumerianProvider'; }

  async loadScene(domElementId: string, sceneConfiguration: SumerianSceneConfiguration) {

    const element = document.getElementById(domElementId);
    const apiResponse = await window.fetch(sceneConfiguration.url);
    const apiResponseJson = await apiResponse.json();

    // Fetch the scene bundle.
    const sceneBundle = await fetch(apiResponseJson.bundleData[sceneConfiguration.sceneId].url, apiResponseJson.bundleData[sceneConfiguration.sceneId].headers);
    const sceneBundleJson = await sceneBundle.json();

    // Create the scene loading script from the code embedded in the bundle.
    const SceneLoader = Function(atob(sceneBundleJson[sceneConfiguration.sceneId].sceneLoadScript))();

    const progressCallback = (progress) => {
        console.log(`Sumerian scene load progress: ${progress * 100}%`);
    }

    // Load the scene.
    SceneLoader.loadScene(element, apiResponseJson, null, progressCallback).then((sceneController) => {
        for (const warning of sceneController.sceneLoadWarnings) {
            console.warn('scene load warning: ' + warning);
        }

        sceneController.on('AudioDisabled', () => {
            // Show the customer a button they can click to enable audio.
            // Call sceneController.enableAudio() in the button's onClick or similar.
        });

        sceneController.on('AudioEnabled', () => {
            // Now that audio is working, remove the button.
        });

        // Start the scene.
        sceneController.start();

    }).catch((error) => {
        console.error(`Failed to load Sumerian scene: ${error}`);
    });
  }
}