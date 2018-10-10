/* eslint-disable */
import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import * as AmplifyUI from '@aws-amplify/ui';
import SignIn from '../src/components/authenticator/SignIn.vue';
import AmplifyEventBus from '../src/events/AmplifyEventBus';
import { AmplifyPlugin } from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';
/* eslint-enable */

Vue.use(AmplifyPlugin, AmplifyMocks);

describe('SignIn', () => {
  it('has a mounted hook', () => {
    expect(typeof SignIn.mounted).toBe('function');
  });

  it('sets the correct default data', () => {
    expect(typeof SignIn.data).toBe('function');
    const defaultData = SignIn.data();
    expect(defaultData.password).toBe('');
    expect(defaultData.logger).toEqual({});
    expect(defaultData.error).toEqual('');
  });

  let wrapper;
  let header;
  let testState;
  const mockSignIn = jest.fn();
  const mockForgot = jest.fn();
  const mockSignUp = jest.fn();
  const mockSetError = jest.fn();

  describe('...when it is mounted without props...', () => {
    beforeEach(() => {
      wrapper = shallowMount(SignIn);
      testState = null;
    });

    it('...it should use the amplify plugin with passed modules', () => {
      expect(wrapper.vm.$Amplify).toBeTruthy();
    });

    it('...it should be named SignIn', () => {
      expect(wrapper.vm.$options.name).toEqual('SignIn');
    });

    it('...it should instantiate a logger with the name of the component', () => {
      expect(wrapper.vm.logger.name).toEqual(wrapper.vm.$options.name);
    });

    it('...it should have a signIn method', () => {
      expect(wrapper.vm.signIn).toBeTruthy();
    });

    it('...should have a forgot method', () => {
      expect(wrapper.vm.forgot).toBeTruthy();
    });

    it('...should have a signUp method', () => {
      expect(wrapper.vm.signUp).toBeTruthy();
    });

    it('...it should have a setError method', () => {
      expect(wrapper.vm.setError).toBeTruthy();
    });

    it('...have default options', () => {
      expect(wrapper.vm.options.header).toEqual('Sign In');
      expect(wrapper.vm.options.username).toEqual('');
    });
    it('...should call Auth.signIn when signIn function is called', () => {
      wrapper.vm.signIn();
      expect(wrapper.vm.$Amplify.Auth.signIn).toHaveBeenCalledTimes(1);
    });
    it('...should emit authState when forgot method called', () => {
      testState = 0;
      AmplifyEventBus.$on('authState', (val) => {
        if (val === 'forgotPassword') {
          testState = 1;
        }
      });
      wrapper.vm.forgot();
      expect(testState).toEqual(1);
    });
    it('...should emit authState when signUp method called', () => {
      testState = 0;
      AmplifyEventBus.$on('authState', (val) => {
        if (val === 'signUp') {
          testState = 2;
        }
      });
      wrapper.vm.signUp();
      expect(testState).toEqual(2);
    });
  });

  describe('...when it is mounted with props...', () => {
    beforeEach(() => {
      header = 'TestHeader';
      wrapper = shallowMount(SignIn, {
        methods: {
          signIn: mockSignIn,
          forgot: mockForgot,
          signUp: mockSignUp,
          setError: mockSetError,
        },
        propsData: {
          signInConfig: {
            username: 'TestPerson',
            header,
          },
        },
      });
    });

    afterEach(() => {
      mockSignIn.mockReset();
      mockForgot.mockReset();
      mockSignUp.mockReset();
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

    it('...should get the passed username', () => {
      expect(wrapper.vm.options.username).toEqual('TestPerson');
    });

    it('...should call signIn when signIn button is clicked', () => {
      const el = wrapper.find(`.${AmplifyUI.sectionFooterPrimaryContent} > button`);
      el.trigger('click');
      expect(mockSignIn).toHaveBeenCalled();
    });

    it('...should not call forgot when reset link is clicked', () => {
      const el = wrapper.find(`.${AmplifyUI.hint} > a`);
      el.trigger('click');
      expect(mockForgot).toHaveBeenCalled();
    });

    it('...should call signUp when signUp link is clicked', () => {
      const el = wrapper.find(`.${AmplifyUI.sectionFooterSecondaryContent} > a`);
      el.trigger('click');
      expect(mockSignUp).toHaveBeenCalled();
    });
  });
});
