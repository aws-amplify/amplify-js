/* eslint-disable */
import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import * as AmplifyUI from '@aws-amplify/ui';
import ForgotPassword from '../src/components/authenticator/ForgotPassword.vue';
import AmplifyEventBus from '../src/events/AmplifyEventBus';
import { AmplifyPlugin } from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';
/* eslint-enable */

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
  let testState;
  const mockSubmit = jest.fn();
  const mockVerify = jest.fn();
  const mockSignIn = jest.fn();
  const mockSetError = jest.fn();

  describe('...when it is mounted without props...', () => {
    beforeEach(() => {
      wrapper = shallowMount(ForgotPassword);
      testState = null;
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

    it('...should call Auth.forgotPassword when submit method is called', () => {
      wrapper.vm.submit();
      expect(wrapper.vm.$Amplify.Auth.forgotPassword).toBeCalledWith(wrapper.vm.username);
    });

    it('...should set the local error variable when setError is called', () => {
      wrapper.vm.setError('I messed up');
      expect(wrapper.vm.error).toEqual('I messed up');
    });

    it('...should call Auth.forgotPasswordSubmit when verify method is called', () => {
      wrapper.vm.verify();
      expect(wrapper.vm.$Amplify.Auth.forgotPasswordSubmit).toBeCalledWith(wrapper.vm.username,
        wrapper.vm.password,
        wrapper.vm.code);
    });

    it('...should emit authState when signIn method called', () => {
      testState = 0;
      AmplifyEventBus.$on('authState', (val) => {
        if (val === 'signedOut') {
          testState = 1;
        }
      });
      wrapper.vm.signIn();
      expect(testState).toEqual(1);
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
          forgotPasswordConfig: {
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
