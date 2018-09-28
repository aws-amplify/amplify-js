/* eslint-disable */
import Vue from 'vue';
import { shallowMount, mount } from '@vue/test-utils';
import * as AmplifyUI from '@aws-amplify/ui';
import PhotoPicker from '../src/components/storage/PhotoPicker.vue';
import { AmplifyPlugin } from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';
/* eslint-enable */

Vue.use(AmplifyPlugin, AmplifyMocks);

describe('PhotoPicker', () => {
  it('has a mounted hook', () => {
    expect(typeof PhotoPicker.mounted).toBe('function');
  });

  it('sets the correct default data', () => {
    expect(typeof PhotoPicker.data).toBe('function');
    const defaultData = PhotoPicker.data();
    expect(defaultData.file).toBe(null);
    expect(defaultData.s3ImagePath).toEqual('');
    expect(defaultData.photoUrl).toEqual('');
    expect(defaultData.logger).toEqual({});
    expect(defaultData.error).toEqual('');
  });

  let wrapper;
  let header;
  let title;
  let accept;
  const mockUpload = jest.fn();
  const mockPick = jest.fn();
  const mockCompleteFileUpload = jest.fn();
  const mockSetError = jest.fn();

  describe('...when it is mounted without props...', () => {
    beforeEach(() => {
      wrapper = shallowMount(PhotoPicker);
    });

    it('...it should use the amplify plugin with passed modules', () => {
      expect(wrapper.vm.$Amplify).toBeTruthy();
    });

    it('...it should be named PhotoPicker', () => {
      expect(wrapper.vm.$options.name).toEqual('PhotoPicker');
    });

    it('...it should instantiate a logger with the name of the component', () => {
      expect(wrapper.vm.logger.name).toEqual(wrapper.vm.$options.name);
    });

    it('...it should have a pick method', () => {
      expect(wrapper.vm.pick).toBeTruthy();
    });

    it('...it should have an upload method', () => {
      expect(wrapper.vm.upload).toBeTruthy();
    });

    it('...it should have a completeFileUpload method', () => {
      expect(wrapper.vm.completeFileUpload).toBeTruthy();
    });

    it('...it should have a setError method', () => {
      expect(wrapper.vm.setError).toBeTruthy();
    });

    it('...have default options', () => {
      expect(wrapper.vm.options.header).toEqual('File Upload');
      expect(wrapper.vm.options.title).toEqual('Upload');
      expect(wrapper.vm.options.accept).toEqual('*/*');
    });
  });

  describe('...when the methods are not mocked...', () => {
    wrapper = mount(PhotoPicker);
    it('...should have a upload method that calls Amplify.Auth.PhotoPicker', () => {
      wrapper.vm.s3ImagePath = 'testPath';
      wrapper.vm.file = { type: 'fakeFile' };
      wrapper.vm.upload();
      expect(wrapper.vm.$Amplify.Storage.put)
      .toHaveBeenCalledWith('testPath', { type: 'fakeFile' }, { contentType: 'fakeFile' });
    });
  });

  describe('...when it is mounted with props...', () => {
    beforeEach(() => {
      header = 'Give me files';
      title = 'Click me';
      accept = 'image/*';
      wrapper = shallowMount(PhotoPicker, {
        methods: {
          upload: mockUpload,
          pick: mockPick,
          completeFileUpload: mockCompleteFileUpload,
          setError: mockSetError,
        },
        propsData: {
          photoPickerConfig: {
            header,
            title,
            accept,
            path: 'url',
          },
        },
      });
    });

    afterEach(() => {
      wrapper.vm.file = null;
    });

    it('...should not set the error property', () => {
      expect(wrapper.vm.error).toEqual('');
      expect(mockSetError).not.toHaveBeenCalled();
    });

    it('...should render the header from props', () => {
      const el = wrapper.find(`.${AmplifyUI.sectionHeader}`).element;
      expect(el.textContent).toEqual(header);
    });

    it('...upload button should not appear when file is not picked', () => {
      const el = wrapper.find('button').element;
      expect(el).toBeFalsy();
    });

    it('...should get the passed upload button text', () => {
      wrapper.vm.file = { foo: 'bar' };
      const text = wrapper.find('button').text();
      expect(text).toEqual(title);
    });

    it('...should call completeFileUpload when upload is clicked', () => {
      wrapper.vm.upload();
      wrapper.vm.file = { foo: 'bar' };
      wrapper.vm.s3ImageFile = 'testImage';
      wrapper.vm.$Amplify.Storage.put('testPath', { type: 'fakeFile' }, { contentType: 'fakeFile' })
      .then((res) => {
        expect(mockCompleteFileUpload).toHaveBeenCalledWith(res.key);
        expect(wrapper.vm.file).toBe(null);
        expect(wrapper.vm.s3ImageFile).toBe(null);
      })
      .catch(e => e);
    });

    it('...should call pick when file input is activated', () => {
      const el = wrapper.find('input');
      el.trigger('change');
      expect(mockPick).toBeCalled();
    });
  });
});
