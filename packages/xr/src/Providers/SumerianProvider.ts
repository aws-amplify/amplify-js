import { ConsoleLogger as Logger, Signer, Credentials } from '@aws-amplify/core';

import { AbstractXRProvider } from './XRProvider';
import { ProviderOptions, SceneParameters } from '../types';

type SumerianSceneConfig = { url: string, isSigv4: boolean, sceneId: string };
type SumerianAdditionalParameters =  { publishParamOverrides: any, progressCallback: (progress: number) => void }
type SumerianSceneParameters = SceneParameters & { domElementId: string, sceneConfig: SumerianSceneConfig, additionalParameters: SumerianAdditionalParameters }

const logger = new Logger('AbstractXRProvider');

const SIGNER_SERVICE_NAME = 'sumerian';

export class SumerianProvider extends AbstractXRProvider {
  constructor(options: ProviderOptions = {}) {
    super(options);
  }

  getProviderName() { return 'SumerianProvider'; }

  async loadScene(sceneParameters: SumerianSceneParameters) {

    const element = document.getElementById(sceneParameters.domElementId);

    if (!element) {
        logger.debug("DOM element id, " + sceneParameters.domElementId + " not found");
        return;
    }

    let apiResponse;
    if (sceneParameters.sceneConfig.isSigv4) {
      const credentials = await Credentials.get();
      const access_info = {
        secret_key: credentials.secretAccessKey,
        access_key: credentials.accessKeyId,
        session_token: credentials.sessionToken,
      }
      
      const service_info = { region: this.options.region, service: SIGNER_SERVICE_NAME };
      const signed_url = Signer.signUrl(sceneParameters.sceneConfig.url, access_info, service_info);

      apiResponse = await fetch(signed_url);
      
    } else {
      apiResponse = await window.fetch(sceneParameters.sceneConfig.url);

    }
    const apiResponseJson = await apiResponse.json();
    
    // Fetch the scene bundle.
    const sceneBundle = await fetch(apiResponseJson.bundleData[sceneParameters.sceneConfig.sceneId].url, apiResponseJson.bundleData[sceneParameters.sceneConfig.sceneId].headers);
    const sceneBundleJson = await sceneBundle.json();

    let SceneLoader;
    try {
      // Create the scene loading script from the code embedded in the bundle.
      SceneLoader = Function(atob(sceneBundleJson[sceneParameters.sceneConfig.sceneId].sceneLoadScript))();
    } catch(error) {
      logger.error(error);
      return null;
    }

    const publishParamOverrides = sceneParameters.additionalParameters ? sceneParameters.additionalParameters.publishParamOverrides : null;
    const progressCallback = sceneParameters.additionalParameters ? sceneParameters.additionalParameters.progressCallback : null;

    // Load the scene and return scene controller
    return await SceneLoader.loadScene(element, apiResponseJson, publishParamOverrides, progressCallback);
  }
}