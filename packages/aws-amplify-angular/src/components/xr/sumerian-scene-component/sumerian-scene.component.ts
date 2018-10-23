import { Component, OnInit, Input } from '@angular/core';
import { XR } from 'aws-amplify';
import * as AmplifyUI from '@aws-amplify/ui';

const SCENE_CONTAINER_DOM_ID = "sumerian-scene-container"
const SCENE_DOM_ID = "sumerian-scene-dom-id";

const template = `
<div id="sumerian-scene-container" class={{AmplifyUI.sumerianSceneContainer}}>
  <div id='sumerian-scene-dom-id' class={{AmplifyUI.sumerianScene}}>
    <sumerian-scene-loading *ngIf="loading" loadPercentage={{loadPercentage}} sceneName={{sceneName}}></sumerian-scene-loading>
  </div>
  <div *ngIf="!loading" class={{AmplifyUI.sceneBar}}>
    <span class={{AmplifyUI.sceneActions}}>
      <div [ngClass]="[AmplifyUI.tooltip, showEnableAudio ? AmplifyUI.autoShowTooltip : '']" [attr.data-text]="showEnableAudio ? 'The scene is muted. Click to unmute.' : (muted ? 'Unmute' : 'Mute')" (click)="muted ? setMuted(false) : setMuted(true)">
        <button class={{AmplifyUI.actionButton}}>
          <svg *ngIf="muted" viewBox="0 0 457 443" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <g id="Page-1" stroke="none" stroke-width="1" fill-rule="evenodd">
                  <g id="sound-mute" transform="translate(-34.000000, -32.000000)" fill-rule="nonzero">
                      <path d="M447.9,108.5 L487.2,69.2 L450.3,32.3 L415,67.6 C414.6,67.2 414.2,66.8 413.8,66.4 C406.1,58.7 393.6,58.7 385.9,66.4 C378.2,74.1 378.2,86.6 385.9,94.3 C386.3,94.7 386.7,95.1 387.1,95.5 L293.2,189.4 L293.2,61.7 C293.2,55.9 289.9,50.7 284.6,48.3 C279.4,45.9 273.2,46.7 268.8,50.5 L139,161.7 L48.8,161.7 C40.6,161.7 34,168.3 34,176.5 L34,329.6 C34,337.8 40.6,344.4 48.8,344.4 L138.2,344.4 L44.5,438.1 L81.4,475 L178.3,378.1 L268.7,455.6 C271.4,457.9 274.9,459.2 278.3,459.2 C280.4,459.2 282.5,458.8 284.5,457.9 C289.7,455.5 293.1,450.2 293.1,444.5 L293.1,263.3 L359.5,196.9 C384.1,240.5 377.9,296.8 340.8,333.9 C333.1,341.6 333.1,354.1 340.8,361.8 C344.6,365.7 349.7,367.6 354.7,367.6 C359.7,367.6 364.8,365.7 368.6,361.8 C421.1,309.3 427.6,227.9 388,168.3 L419.1,137.2 C471.2,223.5 460,337.5 385.6,411.9 C377.9,419.6 377.9,432.1 385.6,439.8 C389.4,443.7 394.5,445.6 399.5,445.6 C404.5,445.6 409.6,443.7 413.4,439.8 C503.5,349.8 514.9,210.8 447.9,108.5 Z" id="Shape"></path>
                  </g>
              </g>
          </svg>
          <svg *ngIf="!muted" viewBox="0 0 458 413" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <g id="Page-1" stroke="none" stroke-width="1" fill-rule="evenodd">
              <g id="sound" transform="translate(-33.000000, -47.000000)" fill-rule="nonzero">
                <path d="M284.568,48.349 C279.318,45.936 273.162,46.793 268.778,50.555 L138.981,161.814 L48.772,161.814 C40.606,161.814 33.996,168.423 33.996,176.589 L33.996,329.662 C33.996,337.828 40.605,344.437 48.772,344.437 L138.981,344.437 L268.768,455.686 C271.496,458.03 274.924,459.243 278.391,459.243 C280.48,459.243 282.588,458.8 284.557,457.894 C289.797,455.481 293.156,450.24 293.156,444.468 L293.156,61.775 C293.166,56.003 289.807,50.762 284.567,48.349 L284.568,48.349 Z" id="Shape"></path>
                <path d="M368.798,144.478 C361.115,136.784 348.635,136.784 340.942,144.478 C333.249,152.172 333.25,164.641 340.942,172.335 C385.475,216.878 385.475,289.356 340.942,333.899 C333.25,341.591 333.25,354.062 340.942,361.755 C344.784,365.606 349.827,367.527 354.87,367.527 C359.913,367.527 364.957,365.606 368.798,361.755 C428.699,301.856 428.699,204.386 368.798,144.477 L368.798,144.478 Z" id="Shape"></path>
                <path d="M413.725,66.504 C406.042,58.81 393.552,58.81 385.869,66.504 C378.177,74.196 378.177,86.667 385.869,94.36 C473.408,181.909 473.408,324.344 385.869,411.884 C378.177,419.576 378.177,432.047 385.869,439.74 C389.711,443.591 394.754,445.512 399.797,445.512 C404.84,445.512 409.884,443.591 413.725,439.74 C516.631,336.844 516.631,169.409 413.725,66.504 Z" id="Shape"></path>
              </g>
            </g>
          </svg>
        </button>
      </div>
      <div *ngIf="isVRCapable" class={{AmplifyUI.tooltip}} data-text="Enter VR" (click)="enterVR()">
        <button class={{AmplifyUI.actionButton}}>
          <svg width="452px" height="296px" viewBox="0 0 452 296" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <g id="Page-1" stroke="none" stroke-width="1" fill-rule="evenodd">
              <g id="VR-off" transform="translate(-40.000000, -108.000000)" fill-rule="nonzero">
                <path d="M462.4,108.8 L67.2,108.8 C52.8,108.8 40,121.6 40,137.6 L40,374.4 C40,390.4 52.8,403.2 67.2,403.2 L176,403.2 C187.2,403.2 196.8,395.2 201.6,385.6 L233.6,307.2 C238.4,294.4 251.2,284.8 265.6,284.8 C280,284.8 292.8,294.4 297.6,307.2 L329.6,385.6 C334.4,395.2 344,403.2 355.2,403.2 L462.4,403.2 C478.4,403.2 491.2,390.4 491.2,374.4 L491.2,137.6 C489.6,121.6 476.8,108.8 462.4,108.8 Z M163.2,307.2 C136,307.2 113.6,284.8 113.6,256 C113.6,227.2 136,204.8 163.2,204.8 C190.4,204.8 212.8,227.2 212.8,256 C212.8,284.8 190.4,307.2 163.2,307.2 Z M366.4,307.2 C339.2,307.2 316.8,284.8 316.8,256 C316.8,227.2 339.2,204.8 366.4,204.8 C393.6,204.8 416,227.2 416,256 C416,284.8 395.2,307.2 366.4,307.2 C366.4,307.2 366.4,307.2 366.4,307.2 Z" id="Shape"></path>
              </g>
            </g>
          </svg>
        </button>
      </div>
      <div class={{AmplifyUI.tooltip}} data-text="Fullscreen">
        <button class={{AmplifyUI.actionButton}} (click)="maximize()">
        <svg width="20px" height="18px" viewBox="0 0 20 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <g id="Icons/Minis/FullScreen" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <path d="M1.04162598,1 L1.04162598,14 L16.0147705,14 L16.0147705,1 L1.04162598,1 Z M0,0 L17,0 L17,15 L0,15 L0,0 Z M9,3 L14,8 L14,3 L9,3 Z M8,12 L3,7 L3,12 L8,12 Z" id="Rectangle" fill="#FFFFFF" fill-rule="nonzero"></path>
          </g>
        </svg>
        </button>
      </div>
    </span>
  </div>
</div>
`

@Component({
  selector: 'sumerian-scene',
  template
})
export class SumerianSceneComponent implements OnInit {
  @Input() sceneName: string;

  loading = false;
  loadPercentage = 0;
  muted = false;
  showEnableAudio = false;
  isVRCapable = false;

  AmplifyUI: AmplifyUI;

  constructor() {
    this.AmplifyUI = AmplifyUI;
  }

  ngOnInit() {
    this.loadAndStartScene();
  }

  async loadAndStartScene() {
    this.loading = true;
    const sceneOptions = { 
      progressCallback: this.progressCallback
    };
    await XR.loadScene(this.sceneName, SCENE_DOM_ID, sceneOptions);
    XR.start(this.sceneName);

    this.loading = false;
    this.muted = XR.isMuted(this.sceneName);

    this.isVRCapable = XR.isVRCapable(this.sceneName);

    XR.onSceneEvent(this.sceneName, 'AudioEnabled', () => this.showEnableAudio = false);
    XR.onSceneEvent(this.sceneName, 'AudioDisabled', () => this.showEnableAudio = true);
  }
  
  setMuted(muted) {
    this.muted = muted;
    XR.setMuted(this.sceneName, muted);
    if (this.showEnableAudio) {
      XR.enableAudio(this.sceneName);
      this.showEnableAudio = false;
    }
  }

  enterVR() {
    XR.enterVR(this.sceneName);
  }

  async maximize() {
    const sceneDomElement: any = document.getElementById(SCENE_CONTAINER_DOM_ID);
    await sceneDomElement.requestFullScreen();
  }

  progressCallback = (progress) => {
    const percentage = progress * 100;
    this.loadPercentage = percentage;
  };
}

class Scene {
  id: number;
  name: string;
  loading: boolean;
  loadPercentage: number;
  muted: boolean;
}
