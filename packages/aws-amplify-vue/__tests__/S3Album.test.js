/* eslint-disable */
import Vue from 'vue';
import { shallowMount, mount } from '@vue/test-utils';
import * as AmplifyUI from '@aws-amplify/ui';
import S3Album from '../src/components/storage/S3Album.vue';
import * as components from '../src/components';
import AmplifyEventBus from '../src/events/AmplifyEventBus';
import { AmplifyPlugin } from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';
/* eslint-enable */

Vue.use(AmplifyPlugin, AmplifyMocks);

describe('S3Album', () => {
  let wrapper;
  const mockGetImages = jest.fn();
  const mockPushImage = jest.fn();
  const mockSetError = jest.fn();

  describe('...when it is mounted with props but methods not mocked...', () => {
    beforeEach(() => {
      wrapper = shallowMount(S3Album, {
        propsData: {
          path: 'testPath',
        },
      });
    });

    it('...it should use the amplify plugin with passed modules', () => {
      expect(wrapper.vm.$Amplify).toBeTruthy();
    });

    it('...it should be named S3Album', () => {
      expect(wrapper.vm.$options.name).toEqual('S3Album');
    });

    it('...it should instantiate a logger with the name of the component', () => {
      expect(wrapper.vm.logger.name).toEqual(wrapper.vm.$options.name);
    });

    it('...it should have a getImages method', () => {
      expect(wrapper.vm.getImages).toBeTruthy();
    });

    it('...it should have a pushImage method', () => {
      expect(wrapper.vm.pushImage).toBeTruthy();
    });

    it('...it should have a setError method', () => {
      expect(wrapper.vm.setError).toBeTruthy();
    });

    it('...should call $Amplify.Storage.list when getImages is called', () => {
      expect(wrapper.vm.$Amplify.Storage.list).toHaveBeenCalled();
    });
  });

  describe('...when it is mounted with props...', () => {
    beforeEach(() => {
      wrapper = shallowMount(S3Album, {
        methods: {
          getImages: mockGetImages,
          pushImage: mockPushImage,
          setError: mockSetError,
        },
        propsData: {
          path: 'testPath',
        },
      });
    });

    afterEach(() => {
      mockGetImages.mockReset();
      mockPushImage.mockReset();
      mockSetError.mockReset();
    });

    it('...should not set the error property', () => {
      expect(wrapper.vm.error).toEqual('');
      expect(mockSetError).not.toHaveBeenCalled();
    });

    it('...should call pushImage when fileUpload event occurs', () => {
      AmplifyEventBus.$emit('fileUpload', { foo: 'bar' });
      expect(mockPushImage).toHaveBeenCalled();
    });
  });
});
