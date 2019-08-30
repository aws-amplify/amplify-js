/*
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

<template>
  <div v-bind:id="SCENE_CONTAINER_DOM_ID" v-bind:class="amplifyUI.sumerianSceneContainer" v-bind:data-test="sumerianScene.container">
    <div v-bind:id="SCENE_DOM_ID" v-bind:class="amplifyUI.sumerianScene" v-bind:data-test="sumerianScene.sumerianScene">
      <div v-if="loading" v-bind:class="amplifyUI.loadingOverlay" v-bind:data-test="sumerianScene.loading">
        <div v-bind:class="amplifyUI.loadingContainer">
          <div v-bind:class="amplifyUI.loadingLogo" v-bind:data-test="sumerianScene.loadingLogo">
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            viewBox="0 0 2000 1195" style="enable-background:new 0 0 2000 1195;" xml:space="preserve">
              <g>
                <path class="st0" d="M1026.8,146.2c-0.7,2.3-1.2,3.7-1.6,5.1C991.8,291,958.5,430.6,925,570.3c-1.6,6.7-3.8,13.3-6.2,19.7
                  c-3.9,10.4-12,16.3-22.8,16.5c-26.3,0.5-52.6,0.5-78.9,0c-9.5-0.2-17.3-5.3-21.2-14.2c-4.1-9.2-7.6-18.7-10.6-28.3
                  c-51-167.3-101.9-334.6-152.7-502c-2.5-8.4-4.7-16.9-6.2-25.5c-2-11.7,3.8-18.9,15.5-19c24.6-0.2,49.2,0.1,73.8,0.4
                  c12,0.2,21.1,5.9,24.8,17.3c5.4,16.3,10.1,32.8,14.4,49.4c33.9,133.3,67.7,266.6,101.5,399.9c0.3,1.3,0.8,2.6,1.5,5
                  c0.7-2,1.3-3,1.5-4.1c19.9-84.2,39.7-168.4,59.6-252.7c14.5-61.3,28.9-122.6,43.4-183.8c0.9-3.6,2.1-7.1,3.2-10.6
                  c4-13.2,13.5-19.8,26.6-20.1c24.1-0.6,48.2-0.5,72.3,0c12.6,0.2,21.5,7.2,25.1,19.2c3.9,12.9,7.1,26,10.1,39.1
                  c32.5,137.8,65,275.6,97.5,413.4c0.3,1.4,0.8,2.8,1.7,5.7c1.7-6.1,3-10.7,4.2-15.3c36.8-142.6,73.6-285.2,110.5-427.8
                  c1.4-5.5,3.7-10.8,5.7-16.2c4.5-12,13.8-17.8,26.1-18.1c21.7-0.6,43.5-0.5,65.2-0.7c2.2,0,4.4,0,6.6,0.3c9.9,1,14.9,5.9,14.3,15.9
                  c-0.4,7.5-1.8,15.1-4.1,22.3c-33.5,107.9-67.2,215.6-100.9,323.5c-20.5,65.7-41,131.4-61.6,197.1c-1.3,4-2.8,7.9-4.3,11.9
                  c-4.9,12.9-14.9,19.1-28.1,19.4c-23.9,0.5-47.9,0.4-71.8,0c-13.6-0.2-23.3-7.1-27.2-20.2c-4.5-15.5-8.3-31.2-12.1-46.9
                  c-31.2-129.6-62.3-259.3-93.4-388.9C1028,150.1,1027.5,148.7,1026.8,146.2z"/>
                <path class="st0" d="M995.7,1194.2c-23.1,0-46.2,0.8-69.3-0.2c-25.4-1.1-50.7-3.5-76-5.7c-77.9-7-154.6-20.9-230.3-40.5
                  c-68.1-17.6-134.6-40.1-199.4-67.3C330.7,1042.5,245.3,996,164.5,941c-53.7-36.6-104.7-76.7-153-120.1c-3.5-3.1-6.6-6.8-9-10.8
                  c-3.5-5.8-3.4-12.1,0.8-17.5c4.3-5.6,10.5-7.4,17.2-5.7c4.5,1.2,8.8,3.3,12.9,5.5c42.2,22.1,83.9,45.3,126.7,66.4
                  c63.2,31.2,128.6,57.4,195.1,80.8c68.4,24,137.7,44.8,208.4,60.6c48.4,10.8,97.2,19.9,146,28.7c29.8,5.3,59.9,8.8,89.9,12.3
                  c23.4,2.7,46.9,4.6,70.3,6.3c22.8,1.7,45.7,3.3,68.5,4c39.8,1.1,79.5,2.1,119.3,1.8c29.9-0.2,59.9-2,89.8-4
                  c26.2-1.7,52.4-3.7,78.4-7.1c46.8-6.2,93.6-12.7,140.1-20.9c99-17.3,196-42.9,290.8-76.1c40.7-14.3,80.6-30.6,120.8-46.1
                  c12-4.6,23.6-5.4,34.7,2c11.5,7.7,15.3,22.7,7.6,34.2c-4,6-9.6,11.4-15.4,15.7c-81,59.3-169.6,104.7-262.8,141.3
                  c-77,30.2-156,53.6-237,70.3c-37.9,7.8-76.1,13.8-114.3,19.6c-24.7,3.7-49.7,6-74.7,8.2c-22.1,1.9-44.3,3.3-66.5,4.1
                  c-17.8,0.7-35.7,0.1-53.6,0.1C995.7,1194.3,995.7,1194.2,995.7,1194.2z"/>
                <path class="st0" d="M1714.8,0c39.2,0.9,85.7,8.5,130.2,26.1c9.3,3.7,17.9,9.3,26.1,15.1c9,6.4,13.3,15.9,13.4,27.1
                  c0,12,0.1,23.9,0,35.9c0,2.5-0.4,5.1-1,7.5c-2.1,8.7-7.4,12.7-16.2,11.4c-5.7-0.9-11.6-2.6-16.8-5c-46.6-21.8-95.9-30.1-147-28.3
                  c-21.5,0.8-42.6,3.5-62.7,11.9c-37.6,15.6-54.4,54.2-39.7,91c7.1,17.8,21.1,28.8,37.3,37.7c21.4,11.8,44.5,19.1,67.6,26.5
                  c31.6,10,63.3,19.7,94.6,30.6c28.5,9.9,55.1,24,76.4,46.1c23.3,24.1,36.4,53.2,39.9,86.5c9.1,86.7-40.5,150.8-109.3,180.7
                  c-38.9,16.8-79.7,24.4-122,24.6c-56.9,0.2-112-9.7-164.9-30.7c-9.4-3.8-18.3-9.3-26.9-14.8c-9.7-6.2-13.6-16.1-13.9-27.3
                  c-0.4-13-0.3-26-0.1-38.9c0.3-14.9,8.1-21.1,22.5-17.3c8.2,2.2,16.2,5.6,24.1,9c52.7,22.5,107.7,31.7,164.8,29.6
                  c24.9-0.9,49.4-4.7,72-16c29.7-14.9,45.7-38.5,44.5-72.4c-0.9-23.7-11.9-41.7-31.7-54.4c-17.2-10.9-36.1-18-55.4-24.1
                  c-36.4-11.5-73.1-22.4-109.3-34.6c-30.8-10.4-58.7-26.2-81.4-50.2c-43.4-45.8-56.3-116.8-30.6-172.5c18.1-39.3,48.5-66.6,86.9-85.5
                  C1624,6.4,1664.5,0,1714.8,0z"/>
                <path class="st0" d="M1860.6,746.5c33.3,0.4,66.3,2.8,98.5,11.6c8.4,2.3,16.5,5.8,24.6,9.1c7.5,3.1,11.9,9.2,13.5,17.2
                  c2.5,12.2,3.1,24.5,2.5,37.1c-1.2,24-5,47.5-10.5,70.8c-12.3,51.3-31.6,99.8-60.1,144.4c-16.5,25.9-36,49.3-59.4,69.2
                  c-5.2,4.4-10.7,8.3-17.9,8.4c-6.8,0-10.7-3.5-10.3-10.2c0.2-4.1,1.3-8.3,2.9-12.1c17-42.7,33.7-85.6,47-129.7
                  c7.6-25.2,14.3-50.6,16.5-76.9c0.7-8.8,0.1-17.9-1.1-26.7c-1.6-12-9.3-19.8-20.2-24.6c-12.5-5.4-25.8-8.2-39.2-9.1
                  c-18.6-1.3-37.4-2.3-56-2c-20.7,0.4-41.3,2.1-62,3.7c-18.8,1.4-37.5,3.3-56.3,5.2c-9.9,1-19.7,2.4-29.5,3.6c-1,0.1-2,0.4-3,0.3
                  c-4.8-0.2-9.7-0.8-12.4-5.4c-2.7-4.6-1.8-9.7,1.5-13.2c5.1-5.5,10.6-10.8,16.9-14.9c36.4-24,76.8-38.4,119.4-46.2
                  c22.1-4,44.6-5.9,67-8.3C1842.1,746.9,1851.4,746.9,1860.6,746.5z"/>
                <path class="st0" d="M591.6,541.4c-21.4-36.5-29.7-76.2-29.7-117.9c-0.1-70.3,0.1-140.6-0.1-211c-0.1-29.6-3.8-58.8-13-87.1
                  c-15.6-48-45.4-83.2-92.4-102.9C424.8,9.3,391.7,3.9,357.9,2c-63.7-3.6-125.3,6.4-184.7,29.3c-11.7,4.5-23,10.3-34.3,16
                  c-11.6,5.8-17.3,15.4-17.1,28.6c0.2,12.6-0.1,25.3,0,37.9c0,2.9,0.1,5.8,0.7,8.5c2,9.5,7.9,13.7,17.3,11.2c8.4-2.2,16.8-5,24.9-8.2
                  c40.4-15.9,81.7-28.9,125.3-32.1c29.7-2.2,59.3-1.4,88.3,6.5c24.2,6.6,44.8,18.5,57.2,41.5c10.1,18.6,15.1,38.7,16.1,59.5
                  c1.3,24.7,1,49.5,1.4,74.3c0,0.8-0.2,1.6-0.3,2.8c-16.1-3.3-31.5-6.6-47.1-9.5c-46.9-8.6-94.1-13.2-141.8-7.7
                  c-33.5,3.9-65.4,12.9-94.4,30.5c-37.4,22.6-64.8,53.5-78.2,95.7c-10.9,34.3-11.9,69.4-4.4,104.4c12,56.1,44.4,96,97.9,117.4
                  c41.8,16.6,85.2,17.2,128.9,9.5c57.4-10.1,104-39.3,142.3-82.5c1.3-1.5,2.7-2.9,4.3-4.8c1.7,3.4,3.1,6.2,4.5,9
                  c10.4,21.4,22.2,42,38.5,59.7c11.2,12.1,24,14.5,37.5,5.8c14.5-9.3,28.8-18.8,42.9-28.6C597.7,567,600.3,556.1,591.6,541.4z
                    M448.3,436.2c-7.1,29.5-25.4,50.8-49.1,68.2c-22,16.2-47.4,23.8-73.8,28.5c-20.7,3.6-41.6,4.4-62.3-0.2
                  c-35.6-8-59.6-35.5-63.5-72.3c-2.3-21.9-1.9-43.5,7-64.1c11.9-27.6,34-43.2,61.9-51.5c21.4-6.4,43.4-7.9,63.7-7.5
                  c41.1,0.2,79.8,5.3,117.9,14.4c1.6,0.4,4.1,2.4,4.1,3.7C454.7,382.5,454.7,409.6,448.3,436.2z"/>
              </g>
            </svg>
          </div>
          <div v-bind:class="amplifyUI.loadingSceneName" v-bind:data-test="sumerianScene.sceneName">{{sceneName}}</div>
          <div v-if="sceneError" v-bind:class="amplifyUI.sceneErrorText" v-bind:data-test="sumerianScene.sceneError">{{sceneError}}</div>
          <div v-if="!sceneError" v-bind:class="amplifyUI.loadingBar" v-bind:data-test="sumerianScene.loadingBar">
            <div v-bind:class="amplifyUI.loadingBarFill" v-bind:style="{ width: loadPercentage + '%'}"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!loading" v-bind:class="amplifyUI.sceneBar" v-bind:data-test="sumerianScene.bar">
      <span v-bind:class="amplifyUI.sceneActions" v-bind:data-test="sumerianScene.actions">
        <div v-bind:class="[amplifyUI.tooltip, showEnableAudio ? amplifyUI.autoShowTooltip : '']" :data-text="showEnableAudio ? 'The scene is muted. Click to unmute.' : (muted ? 'Unmute' : 'Mute')" v-on:click="muted ? setMuted(false) : setMuted(true)">
          <button v-bind:class="amplifyUI.actionButton">
            <svg v-if="muted" width="19px" height="19px" viewBox="0 0 19 19" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <g id="icons/minis/volumeOff" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <path d="M3.48026899,12.9630494 C3.63825091,12.9630494 3.79237961,13.0108921 3.92264322,13.1003479 L8.77467683,16.8113609 C9.29423971,17.1679383 10,16.7950396 10,16.1637406 L10,3.78619489 C10,3.15489596 9.29423971,2.78199725 8.77467683,3.13857463 L3.92264322,6.84545211 C3.79237961,6.93490793 3.63825091,6.9827506 3.48026899,6.9827506 L1.78294894,6.9827506 C1.3505185,6.9827506 1,7.33409518 1,7.76754476 L1,12.1781306 C1,12.6117048 1.3505185,12.9630494 1.78294894,12.9630494 L3.48026899,12.9630494 Z M17.2118156,7 L15.0918385,9.11997713 L12.9718614,7 L12,7.97174685 L14.1200917,10.091724 L12,12.2118156 L12.9718614,13.1835625 L15.0918385,11.0635854 L17.2118156,13.1835625 L18.1835625,12.2118156 L16.0635854,10.091724 L18.1835625,7.97174685 L17.2118156,7 Z" id="Fill-2" fill="#FFFFFF"></path>
              </g>
            </svg>
            <svg v-if="!muted" width="19px" height="19px" viewBox="0 0 19 19" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <g id="icons/minis/volumeOn" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <path d="M3.48026899,12.9630494 L1.78294894,12.9630494 C1.3505185,12.9630494 1,12.6117048 1,12.1781306 L1,7.76754476 C1,7.33409518 1.3505185,6.9827506 1.78294894,6.9827506 L3.48026899,6.9827506 C3.63825091,6.9827506 3.79237961,6.93490793 3.92264322,6.84545211 L8.77467683,3.13857463 C9.29423971,2.78199725 10,3.15489596 10,3.78619489 L10,16.1637406 C10,16.7950396 9.29423971,17.1679383 8.77467683,16.8113609 L3.92264322,13.1003479 C3.79237961,13.0108921 3.63825091,12.9630494 3.48026899,12.9630494 Z M14.9270376,3.03232286 C15.1729267,3.03232286 15.4040399,3.12815658 15.5777627,3.3022351 C17.3699891,5.09889099 18.3570052,7.48235058 18.3570052,10.0135053 C18.3570052,12.54466 17.3699891,14.9281196 15.5777627,16.7247755 C15.4041045,16.898854 15.1729914,16.9947524 14.9270052,16.9947524 C14.6820861,16.9947524 14.4515549,16.899436 14.2777674,16.7263598 C13.9192316,16.3684383 13.9185203,15.7852882 14.2762477,15.4264291 C15.7222893,13.9769926 16.5186727,12.0545954 16.5186727,10.0135053 C16.5186727,7.97241524 15.7222893,6.05001801 14.2762154,4.60058152 C13.9184879,4.24175473 13.9191992,3.65857229 14.277832,3.30065081 C14.4514256,3.1275746 14.6819567,3.03232286 14.9270376,3.03232286 Z M13.5730665,6.11570485 C14.6133991,7.15574642 15.1862998,8.54003279 15.1862998,10.0134924 C15.1862998,11.4892799 14.6113945,12.8741159 13.5675376,13.9128965 C13.3942351,14.0855848 13.1639626,14.1806425 12.9191727,14.1806425 C12.6727016,14.1806425 12.4412975,14.0844531 12.2677039,13.9097926 C12.0944984,13.7358111 11.9994406,13.5047303 11.9999903,13.2592291 C12.0005723,13.0136956 12.096794,12.7831644 12.2708079,12.6100882 C12.9654406,11.9185917 13.3479995,10.996467 13.3479995,10.0134924 C13.3479995,9.03119677 12.966346,8.1086194 12.2733298,7.4157649 C11.9150203,7.05745543 11.9149233,6.47436998 12.2731358,6.11589885 C12.4467617,5.94224065 12.6775838,5.84666559 12.923085,5.84666559 C13.1685538,5.84666559 13.3993436,5.94220831 13.5730665,6.11570485 Z" id="Fill-2" fill="#FFFFFF"></path>
              </g>
            </svg>
          </button>
        </div>
        <div v-if="isVRCapable && !isVRPresentationActive" v-bind:class="amplifyUI.tooltip" data-text="Enter VR" v-on:click="toggleVRPresentation()">
          <button v-bind:class="amplifyUI.actionButton">
            <svg width='19' height='19' viewBox='0 0 17 10' xmlns='http://www.w3.org/2000/svg'>
              <g id='Page-1' fill='none' fillRule='evenodd'>
                <g id='VRon' fill='#FFF' fillRule='nonzero'>
                  <path d='M15.7856977,0.02395184 L15.8915734,0.02395184 C16.5037405,0.02395184 17,0.520211324 17,1.13237842 L17,1.54663675 L17,8.8915038 C17,9.5034193 16.4560011,10 15.7856977,10 L12.0095825,10 C9.98324439,7.1593807 8.80676009,5.741338 8.48012959,5.74587199 C8.16206045,5.75028714 7.01003321,7.1683298 5.02404785,10 L1.21426911,10 C0.543965735,10 3.32031236e-05,9.5034193 3.32031236e-05,8.8915038 L3.32031236e-05,1.54663675 L3.32031236e-05,1.13237842 L3.32031236e-05,1.13237842 C3.32031236e-05,0.520211324 0.496292687,0.02395184 1.10845978,0.02395184 L1.21426911,0.02395184 L15.7856977,0.02395184 Z M4.5,6 C5.32842712,6 6,5.32842712 6,4.5 C6,3.67157288 5.32842712,3 4.5,3 C3.67157288,3 3,3.67157288 3,4.5 C3,5.32842712 3.67157288,6 4.5,6 Z M12.5,6 C13.3284271,6 14,5.32842712 14,4.5 C14,3.67157288 13.3284271,3 12.5,3 C11.6715729,3 11,3.67157288 11,4.5 C11,5.32842712 11.6715729,6 12.5,6 Z'
                  id='Fill-1' />
                </g>
              </g>
            </svg>
          </button>
        </div>
        <div v-if="isVRCapable && isVRPresentationActive" v-bind:class="amplifyUI.tooltip" data-text="Exit VR" v-on:click="toggleVRPresentation()">
          <button v-bind:class="amplifyUI.actionButton">
            <svg width="19px" height="19px" viewBox="0 0 19 19" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <g id="icons/minis/VRon-Copy" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="Group-7-Copy" transform="translate(1.000000, 3.000000)" fill="#FFFFFF">
                  <path d="M15.7856977,3.02395184 L17,3.02395184 L17,4.13237842 L17,4.54663675 L17,11.8915038 C17,12.5034193 16.4560011,13 15.7856977,13 L12.0095825,13 C9.98324439,10.1593807 8.80676009,8.741338 8.48012959,8.74587199 C8.16206045,8.75028714 7.01003321,10.1683298 5.02404785,13 L1.21426911,13 C0.543965735,13 3.32031236e-05,12.5034193 3.32031236e-05,11.8915038 L3.32031236e-05,4.54663675 L3.32031236e-05,4.13237842 L3.32031236e-05,3.02395184 L1.21426911,3.02395184 L15.7856977,3.02395184 Z M4.5,9 C5.32842712,9 6,8.32842712 6,7.5 C6,6.67157288 5.32842712,6 4.5,6 C3.67157288,6 3,6.67157288 3,7.5 C3,8.32842712 3.67157288,9 4.5,9 Z M12.5,9 C13.3284271,9 14,8.32842712 14,7.5 C14,6.67157288 13.3284271,6 12.5,6 C11.6715729,6 11,6.67157288 11,7.5 C11,8.32842712 11.6715729,9 12.5,9 Z M2.5486669,0 L14.420089,0 C14.7977406,0 15.1613805,0.149260956 15.4374308,0.417695511 L16.9999668,2.00634766 L0,2.00634766 L1.58537972,0.395493117 C1.84682061,0.141306827 2.19106994,0 2.5486669,0 Z" id="Fill-1"></path>
                </g>
              </g>
            </svg>
          </button>
        </div>
        <div v-if="!isFullscreen" v-bind:class="amplifyUI.tooltip" data-text="Fullscreen">
          <button v-bind:class="amplifyUI.actionButton" v-on:click="maximize()">
            <svg width="19px" height="19px" viewBox="0 0 19 19" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <g id="icons/minis/screenfull" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <path d="M2.04162598,3 L2.04162598,16 L17.0147705,16 L17.0147705,3 L2.04162598,3 Z M1,2 L18,2 L18,17 L1,17 L1,2 Z M3,4 L16,4 L16,15 L3,15 L3,4 Z" id="Rectangle-Copy" fill="#FFFFFF" fill-rule="nonzero"></path>
              </g>
            </svg>
          </button>
        </div>
        <div v-if="isFullscreen" v-bind:class="amplifyUI.tooltip" data-text="Exit Fullscreen">
          <button v-bind:class="amplifyUI.actionButton" v-on:click="minimize()">
            <svg width="19px" height="19px" viewBox="0 0 19 19" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <g id="icons/minis/screensmall" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <path d="M11,16 L17.0147705,16 L17.0147705,3 L2.04162598,3 L2.04162598,10 L11,10 L11,16 Z M1,2 L18,2 L18,17 L1,17 L1,2 Z" id="Rectangle" fill="#FFFFFF" fill-rule="nonzero"></path>
              </g>
            </svg>
          </button>
        </div>
      </span>
    </div>
  </div>
</template>


<script>
import * as AmplifyUI from '@aws-amplify/ui';
import { sumerianScene } from '../../assets/data-test-attributes';

export default {
  name: 'SumerianScene',
  props: ['sceneName'],
  data () {
    return {
      loading: false,
      loadPercentage: 0,
      isFullscreen: false,
      muted: false,
      showEnableAudio: false,
      isVRCapable: false,
      amplifyUI: AmplifyUI,
      sumerianScene,
      sceneError: null,
      isVRPresentationActive: false
    }
  },
  created () {
    this.SCENE_CONTAINER_DOM_ID = "scene-container-dom-id"
    this.SCENE_DOM_ID = "scene-dom-id";
  },
  mounted() {
    document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('mozfullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('MSFullscreenChange', this.onFullscreenChange.bind(this));

    this.loadAndStartScene();
  },
  destroyed() {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    document.removeEventListener('webkitfullscreenchange', this.onFullscreenChange.bind(this));
    document.removeEventListener('mozfullscreenchange', this.onFullscreenChange.bind(this));
    document.removeEventListener('MSFullscreenChange', this.onFullscreenChange.bind(this));
  },
  methods: {
    progressCallback: function(progress) {
      const percentage = progress * 100;
      this.loadPercentage = percentage;
    },
    async loadAndStartScene() {
      this.loading = true;
      const sceneOptions = { 
        progressCallback: this.progressCallback
      };
      try {
        await this.$Amplify.XR.loadScene(this.sceneName, this.SCENE_DOM_ID, sceneOptions);
      } catch (e) {
        this.sceneError = 'Failed to load scene';
        return;
      }
      this.$Amplify.XR.start(this.sceneName);

      this.loading = false;
      this.muted = this.$Amplify.XR.isMuted(this.sceneName);

      this.isVRCapable = this.$Amplify.XR.isVRCapable(this.sceneName);
      this.isVRPresentationActive = this.$Amplify.XR.isVRPresentationActive(this.sceneName);

      this.$Amplify.XR.onSceneEvent(this.sceneName, 'AudioEnabled', () => this.showEnableAudio = false);
      this.$Amplify.XR.onSceneEvent(this.sceneName, 'AudioDisabled', () => this.showEnableAudio = true);
    },
    setMuted(muted) {
      this.muted = muted;
      this.$Amplify.XR.setMuted(this.sceneName, muted);
      if (this.showEnableAudio) {
        this.$Amplify.XR.enableAudio(this.sceneName);
        this.showEnableAudio = false;
      }
    },
    toggleVRPresentation() {
      try {
        if (this.isVRPresentationActive) {
          this.$Amplify.XR.exitVR(this.sceneName);
        } else {
          this.$Amplify.XR.enterVR(this.sceneName);
        }
      } catch(e) {
        logger.error('Unable to start/stop WebVR System: ' + e.message);
        return;
      }
      this.isVRPresentationActive = !this.isVRPresentationActive;
    },
    onFullscreenChange() {
      const doc = document;
      this.isFullscreen = doc.fullscreenElement !== null;
    },
    async maximize() {
      const sceneDomElement = document.getElementById(this.SCENE_CONTAINER_DOM_ID);
      const requestFullScreen = sceneDomElement.requestFullscreen || sceneDomElement.msRequestFullscreen || sceneDomElement.mozRequestFullScreen || sceneDomElement.webkitRequestFullscreen;
      requestFullScreen.call(sceneDomElement);
    },
    async minimize() {
      const doc = document;
      if(doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if(doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if(doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      }
    }
  }
}
</script>
