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
import { default as XR } from '../src/XR';

describe('XR', () => {
    describe('configure', () => {
        test('configure from constructor', () => {
            const xr = new XR({ scenes: {} });

            const config = xr.configure({});
            expect(config).toEqual({ scenes: {} });
        });

        test('configure from configure method', () => {
            const xr = new XR({});
            const options = { scenes: {} };

            const config = xr.configure(options);
            expect(config).toEqual(options);
        });

        test('provider not configured', () => {
            const xr = new XR({});
            try {
                xr.getSceneController('scene1', 'ThreeJSProvider');
            } catch(e) {
                expect(e.message).toEqual("Provider 'ThreeJSProvider' not configured");
                expect(e).toBeInstanceOf(Error);
            }
        });
    });

    describe('SumerianProvider', () => {
        test('loadScene throws error when no scenes are configured', async () => {
            const xr = new XR({});

            // Mock dom
            document.body.innerHTML = "<div id='dom-element-id'></div>";
            expect.assertions(2);
            try {
                await xr.loadScene('scene1', 'dom-element-id');
            } catch(e) {
                expect(e.message).toEqual("No scenes were defined in the configuration");
                expect(e).toBeInstanceOf(Error);
            }
        });

        test('loadScene throws error when dom element does not exist', async () => {
            const xr = new XR({ scenes: { 'scene1': {} } });

            document.body.innerHTML = "";
            expect.assertions(2);
            try {
                await xr.loadScene('scene1', 'dom-element-id');
            } catch(e) {
                expect(e.message).toEqual('DOM element id, dom-element-id not found');
                expect(e).toBeInstanceOf(Error);
            }
        });

        test('loadScene throws error when sceneName is not passed in', async () => {
            const xr = new XR({ scenes: {} });

            // Mock dom
            document.body.innerHTML = "<div id='dom-element-id'></div>";
            expect.assertions(2);
            try {
                await xr.loadScene(undefined, 'dom-element-id');
            } catch(e) {
                expect(e.message).toEqual("No scene name passed into loadScene");
                expect(e).toBeInstanceOf(Error);
            }
        });

        test('loadScene throws error when scene is not configured', async () => {
            const xr = new XR({ scenes: {} });

            // Mock dom
            document.body.innerHTML = "<div id='dom-element-id'></div>";
            expect.assertions(2);
            try {
                await xr.loadScene('scene2', 'dom-element-id');
            } catch(e) {
                expect(e.message).toEqual("Scene 'scene2' is not configured");
                expect(e).toBeInstanceOf(Error);
            }
        });

        test('loadScene throws error when region is not configured', async () => {
            const xr = new XR({scenes:{scene2:{sceneConfig:{}}}});

            // Mock dom
            document.body.innerHTML = "<div id='dom-element-id'></div>";
            expect.assertions(2);
            try {
                await xr.loadScene('scene2', 'dom-element-id');
            } catch(e) {
                expect(e.message).toEqual("No region configured for scene: scene2");
                expect(e).toBeInstanceOf(Error);
            }
        });

        test('isMuted returns muted boolean on scene controller', () => {
            const xr = new XR({
                scenes: {
                    'scene1': {
                        sceneController: {
                            muted: false
                        }
                    }
                }
            });

            const muted = xr.isMuted('scene1');
            expect.assertions(1);
            expect(muted).toBe(false);
        });

        test('setMuted sets muted value on scene controller', () => {
            const xr = new XR({
                scenes: {
                    'scene1': {
                        sceneController: {
                            muted: false
                        }
                    }
                }
            });
            
            expect.assertions(1);
            xr.setMuted('scene1', true);
            const muted = xr.isMuted('scene1');
            expect(muted).toBe(true);
        });

        test('isVRCapable returns vrCapable boolean on scene controller', () => {
            const xr = new XR({
                scenes: {
                    'scene1': {
                        sceneController: {
                            vrCapable: false
                        }
                    }
                }
            });
            
            expect.assertions(1);
            const isVRCapable = xr.isVRCapable('scene1');
            expect(isVRCapable).toBe(false);
        });

        test('isSceneLoaded returns isLoaded value on scene object', () => {
            const xr = new XR({
                scenes: {
                    'scene1': {
                        isLoaded: true
                    }
                }
            });
            
            expect.assertions(1);
            const isLoaded = xr.isSceneLoaded('scene1');
            expect(isLoaded).toBe(true);
        });

        test('getSceneController returns a sceneController', () => {
            const xr = new XR({
                scenes: {
                    'scene1': {
                        sceneController: {
                            muted: false
                        }
                    }
                }
            });

            const mockSceneController = {
                muted: false
            };
            
            expect.assertions(1);
            const sceneController = xr.getSceneController('scene1');
            expect(sceneController).toEqual(mockSceneController);
        });
    })
});
