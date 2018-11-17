/* eslint-disable */
import Vue from 'vue';
import { shallowMount, mount } from '@vue/test-utils';
import * as AmplifyUI from '@aws-amplify/ui';
import S3Image from '../src/components/storage/S3Image.vue';
import * as components from '../src/components';
import AmplifyEventBus from '../src/events/AmplifyEventBus';
import { AmplifyPlugin } from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';
/* eslint-enable */

Vue.use(AmplifyPlugin, AmplifyMocks);

describe('S3Image', () => {
  let wrapper;
  const mockGetImage = jest.fn();
  const mockBlowUp = jest.fn();
  const mockSetError = jest.fn();

  describe('...when it is mounted with props but methods not mocked...', () => {
    beforeEach(() => {
      global.open = jest.fn();
      wrapper = shallowMount(S3Image, {
        propsData: {
          path: 'testPath',
        },
      });
    });

    it('...it should use the amplify plugin with passed modules', () => {
      expect(wrapper.vm.$Amplify).toBeTruthy();
    });

    it('...it should be named S3Image', () => {
      expect(wrapper.vm.$options.name).toEqual('S3Image');
    });

    it('...it should instantiate a logger with the name of the component', () => {
      expect(wrapper.vm.logger.name).toEqual(wrapper.vm.$options.name);
    });

    it('...it should have a getImage method', () => {
      expect(wrapper.vm.getImage).toBeTruthy();
    });

    it('...it should have a blowUp method', () => {
      expect(wrapper.vm.blowUp).toBeTruthy();
    });

    it('...it should have a setError method', () => {
      expect(wrapper.vm.setError).toBeTruthy();
    });

    it('...should not call $Amplify.Storage.get when getImages is called witout imagePath', () => {
      wrapper.vm.getImage();
      expect(wrapper.vm.$Amplify.Storage.get).not.toHaveBeenCalled();
    });

    it('...should not call $Amplify.Storage.get when getImages is called witout imagePath', () => {
      wrapper.vm.imagePath = 'testPath';
      wrapper.vm.getImage();
      expect(wrapper.vm.$Amplify.Storage.get).toHaveBeenCalled();
    });

    it('...should not call window.open when blowUp is called', () => {
      wrapper.vm.blowUp();
      expect(global.open).toHaveBeenCalled();
    });
  });

  describe('...when it is mounted with props...', () => {
    beforeEach(() => {
      wrapper = shallowMount(S3Image, {
        methods: {
          blowUp: mockBlowUp,
          getImage: mockGetImage,
          setError: mockSetError,
        },
        propsData: {
          path: 'testPath',
        },
      });
    });

    afterEach(() => {
      mockGetImage.mockReset();
      mockBlowUp.mockReset();
      mockSetError.mockReset();
    });

    it('...should not set the error property', () => {
      expect(wrapper.vm.error).toEqual('');
      expect(mockSetError).not.toHaveBeenCalled();
    });

    it('...should call blowUp when image element is clicked', () => {
      const el = wrapper.find('img');
      el.trigger('click');
      expect(mockBlowUp).toHaveBeenCalled();
    });
  });
});
