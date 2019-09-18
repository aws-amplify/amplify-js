/* eslint-disable */
import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import SumerianScene from '../src/components/xr/SumerianScene.vue';
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
				},
			});
		});

		it('...it should be named SumerianScene', () => {
			expect(wrapper.vm.$options.name).toEqual('SumerianScene');
		});

		it('...should call scene setup functions after scene load', async () => {
			await wrapper.vm.loadAndStartScene();
			expect(wrapper.vm.$Amplify.XR.onSceneEvent).toHaveBeenCalled();
			expect(wrapper.vm.$Amplify.XR.isVRCapable).toHaveBeenCalled();
			expect(wrapper.vm.$Amplify.XR.isMuted).toHaveBeenCalled();
			expect(wrapper.vm.$Amplify.XR.start).toHaveBeenCalled();
			expect(wrapper.vm.$Amplify.XR.loadScene).toHaveBeenCalled();
		});

		it('...should call $Amplify.XR.setMuted after setMuted is called', () => {
			expect(wrapper.vm.$Amplify.XR.setMuted).not.toHaveBeenCalled();
			wrapper.vm.setMuted(true);
			expect(wrapper.vm.$Amplify.XR.setMuted).toHaveBeenCalled();
		});

		it('...should call toggle isVRPresentationActive after toggleVRPresentation is called', () => {
			expect(wrapper.vm.isVRPresentationActive).toBeFalsy();
			wrapper.vm.toggleVRPresentation();
			expect(wrapper.vm.$Amplify.XR.enterVR).toHaveBeenCalled();
			expect(wrapper.vm.isVRPresentationActive).toBeTruthy();

			wrapper.vm.toggleVRPresentation();
			expect(wrapper.vm.$Amplify.XR.exitVR).toHaveBeenCalled();
		});

		it('...should have sceneName prop', () => {
			expect(wrapper.vm.sceneName).toEqual('testSceneName');
		});
	});
});
