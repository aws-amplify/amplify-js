import { RestClient } from '@aws-amplify/api';
import { ConsoleLogger as Logger} from '@aws-amplify/core';

import { AbstractXRProvider } from './XRProvider';
import { ProviderOptions, SceneConfig } from '../types';

type SumerianSceneConfig = SceneConfig & { url: string, isSigv4: boolean, sceneId: string };
type SumerianAdditionalParameters =  { publishParamOverrides: any, progressCallback: (progress: number) => void }

const logger = new Logger('AbstractXRProvider');

export class SumerianProvider extends AbstractXRProvider {
  constructor(options: ProviderOptions = {}) {
      super(options);
  }

  getProviderName() { return 'SumerianProvider'; }

  async loadScene(domElementId: string, sceneConfig: SumerianSceneConfig, additionalParameters?: SumerianAdditionalParameters) {

    const element = document.getElementById(domElementId);

    if (!element) {
        logger.debug("DOM element id, " + domElementId + " not found");
        return;
    }

    const apiResponseJson = await RestClient.get(sceneConfig.url, {});

    // Fetch the scene bundle.
    const sceneBundle = await fetch(apiResponseJson.bundleData[sceneConfig.sceneId].url, apiResponseJson.bundleData[sceneConfig.sceneId].headers);
    const sceneBundleJson = await sceneBundle.json();

    // Create the scene loading script from the code embedded in the bundle.
    const SceneLoader = Function(atob(sceneBundleJson[sceneConfig.sceneId].sceneLoadScript))();

    const publishParamOverrides = additionalParameters ? additionalParameters.publishParamOverrides : null;
    const progressCallback = additionalParameters ? additionalParameters.progressCallback : null;

    // Load the scene and return scene controller
    return await SceneLoader.loadScene(element, apiResponseJson, publishParamOverrides, progressCallback);
  }
}