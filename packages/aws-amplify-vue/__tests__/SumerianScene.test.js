/* eslint-disable */
import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import SumerianScene from '../src/components/xr/SumerianScene.vue';
import * as AmplifyUI from '@aws-amplify/ui';
import AmplifyPlugin from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';
/* eslint-enable */

Vue.use(AmplifyPlugin, AmplifyMocks);

describe('SumerianScene', () => {
  let wrapper;

  describe('mounted with props but methods not mocked...', () => {
    beforeEach(() => {
      global.open = jest.fn();
      wrapper = shallowMount(SumerianScene, {
        propsData: {
          sceneName: 'testSceneName',
          sumerianSceneConfig: {
            classOverrides: {
              sumerianSceneContainer: ['test-class-1']
            }
          },
          classOverrides: {
            sumerianSceneContainer: ['test-class-2', 'test-class-3']
          }
        }
      });
    });

    it('...it should be named SumerianScene', () => {
      expect(wrapper.vm.$options.name).toEqual('SumerianScene');
    });

    it('...should call $Amplify.XR.loadScene when mounted', () => {
      expect(wrapper.vm.$Amplify.XR.loadScene).toHaveBeenCalled();
    });

    it('...should call $Amplify.XR.isMuted after scene load', () => {
      expect(wrapper.vm.$Amplify.XR.isMuted).toHaveBeenCalled();
    });

    it('...should call $Amplify.XR.start after scene load', () => {
      expect(wrapper.vm.$Amplify.XR.start).toHaveBeenCalled();
    });

    it('...should call $Amplify.XR.isVRCapable after scene load', () => {
      expect(wrapper.vm.$Amplify.XR.isVRCapable).toHaveBeenCalled();
    });

    it('...should call $Amplify.XR.onSceneEvent after scene load', () => {
      expect(wrapper.vm.$Amplify.XR.onSceneEvent).toHaveBeenCalled();
    });
    
    it('...should call $Amplify.XR.setMuted after setMuted is called', () => {
      expect(wrapper.vm.$Amplify.XR.setMuted).not.toHaveBeenCalled();
      wrapper.vm.setMuted(true);
      expect(wrapper.vm.$Amplify.XR.setMuted).toHaveBeenCalled();
    });

    it('...should call $Amplify.XR.enterVR after enterVR is called', () => {
      expect(wrapper.vm.$Amplify.XR.enterVR).not.toHaveBeenCalled();
      wrapper.vm.enterVR();
      expect(wrapper.vm.$Amplify.XR.enterVR).toHaveBeenCalled();
    });

    it('...should have sceneName prop', () => {
      expect(wrapper.vm.sceneName).toEqual('testSceneName');
    });

    it('...should return an array of classes when applyClasses is called', () => {
      const classes = wrapper.vm.applyClasses('sumerianSceneContainer');
      expect(classes).toContain(AmplifyUI['sumerianSceneContainer']);
      expect(classes).toContain('test-class-1');
      expect(classes).toContain('test-class-2');
      expect(classes).toContain('test-class-3');
    });

    it('...should have a dom element with class overrides', () => {
      const el = wrapper.find(`.${AmplifyUI.sumerianSceneContainer}`);
      expect(el.is('div')).toBe(true);
      expect(el.classes()).toContain('test-class-1');
      expect(el.classes()).toContain('test-class-2');
      expect(el.classes()).toContain('test-class-3');
    });
  });
});
