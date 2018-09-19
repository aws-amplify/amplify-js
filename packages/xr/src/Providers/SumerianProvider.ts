import { ConsoleLogger as Logger, Signer, Credentials, Constants } from '@aws-amplify/core';

import { AbstractXRProvider } from './XRProvider';
import { ProviderOptions, SceneOptions } from '../types';
import { 
  XRNoSceneConfiguredError,
  XRSceneNotFoundError,
  XRSceneNotLoadedError,
  XRNoDomElement,
  XRSceneLoadFailure
} from '../Errors';


type SumerianSceneOptions = SceneOptions & { progressCallback: Function }

const SUMERIAN_SERVICE_NAME = 'sumerian';

const logger = new Logger('SumerianProvider');

export class SumerianProvider extends AbstractXRProvider {
  constructor(options: ProviderOptions = {}) {
    super(options);
  }

  getProviderName() { return 'SumerianProvider'; }

  private async loadScript(url) {
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

  public async loadScene(sceneName: string, domElementId: string, sceneOptions: SumerianSceneOptions) { 
    
    if (!sceneName) {
      const errorMsg = "No scene name passed into loadScene";
      logger.error(errorMsg);
      throw(new XRSceneLoadFailure(errorMsg));
    }
    
    if (!domElementId) {
      const errorMsg = "No dom element id passed into loadScene";
      logger.error(errorMsg);
      throw(new XRNoDomElement(errorMsg));
    }

    const element = document.getElementById(domElementId);
    if (!element) {
        const errorMsg = "DOM element id, " + domElementId + " not found";
        logger.error(errorMsg);
        throw(new XRNoDomElement(errorMsg));
    }

    const scene = this.getScene(sceneName);
    if (!scene.sceneConfig) {
      const errorMsg = "No scene config configured for scene: " + sceneName;
      logger.error(errorMsg);
      throw(new XRSceneLoadFailure(errorMsg));
    }

    const sceneUrl = scene.sceneConfig.url;
    const sceneId = scene.sceneConfig.sceneId;
    const awsSDKConfigOverride = {
        region: this.options.region,
        customUserAgent: `${Constants.userAgent}-SumerianScene`
    };

    let apiResponse;
    try {
      // Get credentials from Auth and sign the request
      const credentials = await Credentials.get();
      const accessInfo = {
        secret_key: credentials.secretAccessKey,
        access_key: credentials.accessKeyId,
        session_token: credentials.sessionToken,
      }
      
      const serviceInfo = { region: this.options.region, service: SUMERIAN_SERVICE_NAME };
      const signedUrl = Signer.signUrl(sceneUrl, accessInfo, serviceInfo);
      apiResponse = await fetch(signedUrl);
      awsSDKConfigOverride["credentials"] = credentials;

    } catch (e) {
      logger.debug('No credentials available, the request will be unsigned');
      apiResponse = await fetch(sceneUrl);
    }
    
    const apiResponseJson = await apiResponse.json();
    
    // Get bundle data from scene api response
    const sceneBundle = await fetch(apiResponseJson.bundleData[sceneId].url, apiResponseJson.bundleData[sceneId].headers);
    const sceneBundleJson = await sceneBundle.json();

    try {
      // Load the Sumerian bootstrapper script into the DOM
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
      progressCallback: sceneOptions.progressCallback,
      publishParamOverrides,
      awsSDKConfigOverride: awsSDKConfigOverride
    }

    // Load the scene into the dom and set the scene controller
    const sceneController = await (<any>window).SumerianBootstrapper.loadScene(sceneLoadParams);
    scene.sceneController = sceneController;
    scene.isLoaded = true;

    // Log scene warnings
    for (const warning of sceneController.sceneLoadWarnings) {
      logger.warn('loadScene warning: ' + warning);
    }
  }

  public isSceneLoaded(sceneName: string) {
    const scene = this.getScene(sceneName);
    return scene.isLoaded || false;
  }

  private getScene(sceneName: string) {
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

  public getSceneController(sceneName: string) {
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

  public isVRCapable(sceneName: string): boolean {
    const sceneController = this.getSceneController(sceneName);
    return sceneController.vrCapable;
  }

  public start(sceneName: string) {
    const sceneController = this.getSceneController(sceneName);
    sceneController.start();
  }

  public enterVR(sceneName: string) {
    const sceneController = this.getSceneController(sceneName);
    sceneController.enterVR();
  }

  public exitVR(sceneName: string) {
    const sceneController = this.getSceneController(sceneName);
    sceneController.exitVR();
  }

  public isMuted(sceneName: string): boolean {
    const sceneController = this.getSceneController(sceneName);
    return sceneController.muted;
  }

  public setMuted(sceneName: string, muted: boolean) {
    const sceneController = this.getSceneController(sceneName);
    sceneController.muted = muted;
  }

  public onSceneEvent(sceneName: string, eventName: string, eventHandler: Function) {
    const sceneController = this.getSceneController(sceneName);
    sceneController.on(eventName, eventHandler);
  }

  public enableAudio(sceneName: string) {
    const sceneController = this.getSceneController(sceneName);
    sceneController.enableAudio();
  }
}