import { ConsoleLogger as Logger, Signer, Credentials } from '@aws-amplify/core';

import { AbstractXRProvider } from './XRProvider';
import { ProviderOptions, SceneParameters } from '../types';
import { 
  XRNoSceneConfiguredError,
  XRSceneNotFoundError,
  XRSceneNotLoadedError,
  XRNoDomElement,
  XRSceneLoadFailure
} from '../Errors';

type SumerianSceneParameters = SceneParameters & { sceneName: string, domElementId: string }

const SUMERIAN_SERVICE_NAME = 'sumerian';

const logger = new Logger('SumerianProvider');

export class SumerianProvider extends AbstractXRProvider {
  constructor(options: ProviderOptions = {}) {
    super(options);
  }

  getProviderName() { return 'SumerianProvider'; }

  async loadScript(url) {
    return new Promise((resolve, reject) => {
        const scriptElement = document.createElement('script');
        scriptElement.src = url;

        scriptElement.addEventListener('load', (event) => {
            resolve();
        });

        scriptElement.addEventListener('error', (event) => {
            reject(new Error("Failed to load script: " + url));
        });

        document.head.appendChild(scriptElement);
    });
  }

  async loadScene(sceneParameters: SumerianSceneParameters, progressCallback: Function) {
    if (!sceneParameters) {
      const errorMsg = "No scene parameters passed into loadScene";
      logger.error(errorMsg);
      throw(new XRSceneLoadFailure(errorMsg));
    }
    
    if (!sceneParameters.domElementId) {
      const errorMsg = "No dom element id passed into loadScene";
      logger.error(errorMsg);
      throw(new XRNoDomElement(errorMsg));
    }

    const element = document.getElementById(sceneParameters.domElementId);
    if (!element) {
        const errorMsg = "DOM element id, " + sceneParameters.domElementId + " not found";
        logger.error(errorMsg);
        throw(new XRNoDomElement(errorMsg));
    }

    const scene = this.getScene(sceneParameters.sceneName);
    if (!scene.sceneConfig) {
      const errorMsg = "No scene config configured for scene: " + sceneParameters.sceneName;
      logger.error(errorMsg);
      throw(new XRSceneLoadFailure(errorMsg));
    }

    const credentials = await Credentials.get();
    const accessInfo = {
      secret_key: credentials.secretAccessKey,
      access_key: credentials.accessKeyId,
      session_token: credentials.sessionToken,
    }
    
    const serviceInfo = { region: this.options.region, service: SUMERIAN_SERVICE_NAME };
    const signedUrl = Signer.signUrl(scene.sceneConfig.url, accessInfo, serviceInfo);

    const apiResponse = await fetch(signedUrl);
    const apiResponseJson = await apiResponse.json();
    
    const sceneId = scene.sceneConfig.sceneId;
    const sceneBundle = await fetch(apiResponseJson.bundleData[sceneId].url, apiResponseJson.bundleData[sceneId].headers);
    const sceneBundleJson = await sceneBundle.json();

    try {
      // Create the scene loading script from the code embedded in the bundle.
      await this.loadScript(sceneBundleJson[sceneId].bootstrapperUrl);
    } catch(error) {
      logger.error(error);
      throw(new XRSceneLoadFailure(error));
    }

    const publishParamOverrides = scene.publishParamOverrides ? scene.publishParamOverrides : null;

    const sceneLoadParams = {
      element,
      sceneId,
      sceneBundle: sceneBundleJson,
      apiResponse: apiResponseJson,
      progressCallback,
      publishParamOverrides
    }

    // Load the scene and return scene controller
    const sceneController = await (<any>window).SumerianBootstrapper.loadScene(sceneLoadParams);
    for (const warning of sceneController.sceneLoadWarnings) {
      logger.warn('loadScene warning: ' + warning);
    }
    
    this.options.scenes[sceneParameters.sceneName].sceneController = sceneController;
  }

  getScene(sceneName) {
    if (!this.options.scenes) {
      const errorMsg = "No scenes were defined in the configuration";
      logger.error(errorMsg);
      throw(new XRNoSceneConfiguredError(errorMsg));
    }

    if (!sceneName) {
      const errorMsg = "No scene name was passed";
      logger.error(errorMsg);
      throw(new XRSceneNotFoundError(errorMsg));
    }

    if (!this.options.scenes[sceneName]) {
      const errorMsg = "Scene '" + sceneName + "' is not configured";
      logger.error(errorMsg);
      throw(new XRSceneNotFoundError(errorMsg));
    }

    return this.options.scenes[sceneName];
  }

  getSceneController(sceneName: string) {
    if (!this.options.scenes) {
      const errorMsg = "No scenes were defined in the configuration";
      logger.error(errorMsg);
      throw(new XRNoSceneConfiguredError(errorMsg));
    }

    const scene = this.options.scenes[sceneName];
    if (!scene) {
      const errorMsg = "Scene '" + sceneName + "' is not configured";
      logger.error(errorMsg);
      throw(new XRSceneNotFoundError(errorMsg));
    }

    const sceneController = scene.sceneController
    if (!sceneController) {
      const errorMsg = "Scene controller for '" + sceneName + "' has not been loaded";
      logger.error(errorMsg);
      throw(new XRSceneNotLoadedError(errorMsg));
    }

    return sceneController;
  }

  isVRCapable(sceneName: string): boolean {
    const sceneController = this.getSceneController(sceneName);
    return sceneController.vrCapable;
  }

  start(sceneName: string) {
    const sceneController = this.getSceneController(sceneName);
    sceneController.start();
  }

  enterVR(sceneName: string) {
    const sceneController = this.getSceneController(sceneName);
    sceneController.enterVR();
  }

  exitVR(sceneName: string) {
    const sceneController = this.getSceneController(sceneName);
    sceneController.exitVR();
  }

  isMuted(sceneName: string): boolean {
    const sceneController = this.getSceneController(sceneName);
    return sceneController.muted;
  }

  setMuted(sceneName: string, muted: boolean) {
    const sceneController = this.getSceneController(sceneName);
    sceneController.muted = muted;
  }

  onAudioDisabled(sceneName: string, eventHandler: Function) {
    const sceneController = this.getSceneController(sceneName);
    sceneController.on('AudioDisabled', eventHandler);
  }

  onAudioEnabled(sceneName: string, eventHandler: Function) {
    const sceneController = this.getSceneController(sceneName);
    sceneController.on('AudioEnabled', eventHandler);
  }

  enableAudio(sceneName: string) {
    const sceneController = this.getSceneController(sceneName);
    sceneController.enableAudio();
  }
}