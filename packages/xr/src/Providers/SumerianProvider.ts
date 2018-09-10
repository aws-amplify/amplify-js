import { AbstractXRProvider } from './XRProvider';
import { ProviderOptions } from '../types';

export class SumerianProvider extends AbstractXRProvider {
  constructor(options: ProviderOptions = {}) {
      super({ ...options, clientId: options.clientId });
  }

  getProviderName() { return 'SumerianProvider'; }

  async loadScene(sceneId: string) {

    let element = document.getElementById("my-sumerian-scene");

    // console.log("Sumerian Provider: loadScene with id " + sceneId);

    const apiUrl = "https://km58koggw4.execute-api.us-west-2.amazonaws.com/20180801/projects/arn:aws:sumerian:us-west-2:827981793408:project:test/releases/MyRelease/authTokens/public";
    const apiResponse = await window.fetch(apiUrl);
    const apiResponseJson = await apiResponse.json();

    // Find the first (and only) scene id in the bundle data.
    let publishedSceneId = null;
    for (const id in apiResponseJson.bundleData) {
        if (/\.scene$/.test(id)) {
            publishedSceneId = id;
            break;
        }
    }

    // Fetch the scene bundle.
    const sceneBundle = await window.fetch(apiResponseJson.bundleData[publishedSceneId].url, apiResponseJson.bundleData[publishedSceneId].headers);
    const sceneBundleJson = await sceneBundle.json();

    // Create the scene loading script from the code embedded in the bundle.
    const SceneLoader = Function(atob(sceneBundleJson[publishedSceneId].sceneLoadScript))();

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