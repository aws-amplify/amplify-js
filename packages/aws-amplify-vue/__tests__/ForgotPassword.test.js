import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import * as AmplifyUI from '@aws-amplify/ui';
import ForgotPassword from '../src/components/authenticator/ForgotPassword.vue';
import { AmplifyPlugin } from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';

Vue.use(AmplifyPlugin, AmplifyMocks);

describe('ForgotPassword', () => {
  it('has a mounted hook', () => {
    expect(typeof ForgotPassword.mounted).toBe('function');
  });

  it('sets the correct default data', () => {
    expect(typeof ForgotPassword.data).toBe('function');
    const defaultData = ForgotPassword.data();
    expect(defaultData.code).toBe('');
    expect(defaultData.logger).toEqual({});
    expect(defaultData.error).toEqual('');
  });

  let wrapper;
  let header;
  const mockSubmit = jest.fn();
  const mockVerify = jest.fn();
  const mockSignIn = jest.fn();
  const mockSetError = jest.fn();

  describe('...when it is mounted without props...', () => {
    beforeEach(() => {
      wrapper = shallowMount(ForgotPassword);
    });

    it('...it should use the amplify plugin with passed modules', () => {
      expect(wrapper.vm.$Amplify).toBeTruthy();
    });

    it('...it should be named ForgotPassword', () => {
      expect(wrapper.vm.$options.name).toEqual('ForgotPassword');
    });

    it('...it should instantiate a logger with the name of the component', () => {
      expect(wrapper.vm.logger.name).toEqual(wrapper.vm.$options.name);
    });

    it('...it should have an send method', () => {
      expect(wrapper.vm.verify).toBeTruthy();
    });

    it('...should have a submit method', () => {
      expect(wrapper.vm.submit).toBeTruthy();
    });

    it('...should have a signIn method', () => {
      expect(wrapper.vm.signIn).toBeTruthy();
    });

    it('...it should have a setError method', () => {
      expect(wrapper.vm.setError).toBeTruthy();
    });

    it('...have default options', () => {
      expect(wrapper.vm.options.header).toEqual('Forgot Password');
    });
  });

  describe('...when it is mounted with props...', () => {
    beforeEach(() => {
      header = 'TestHeader';
      wrapper = shallowMount(ForgotPassword, {
        methods: {
          verify: mockVerify,
          submit: mockSubmit,
          signIn: mockSignIn,
          setError: mockSetError,
        },
        propsData: {
          forgotPasswordOptions: {
            header,
          },
        },
      });
    });

    afterEach(() => {
      mockVerify.mockReset();
      mockSubmit.mockReset();
      mockSignIn.mockReset();
      mockSetError.mockReset();
    });
    it('...should not set the error property', () => {
      expect(wrapper.vm.error).toEqual('');
      expect(mockSetError).not.toHaveBeenCalled();
    });

    it('...should render the header from props', () => {
      const el = wrapper.find(`.${AmplifyUI.sectionHeader}`).element;
      expect(el.textContent).toEqual(header);
    });

    it('...should call signIn when signIn button is clicked', () => {
      const el = wrapper.find(`.${AmplifyUI.sectionFooterSecondaryContent} > .${AmplifyUI.a}`);
      el.trigger('click');
      expect(mockSignIn).toHaveBeenCalled();
    });
  });
});
