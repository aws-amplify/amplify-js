/* eslint-disable */
import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import * as AmplifyUI from '@aws-amplify/ui';
import ConfirmSignIn from '../src/components/authenticator/ConfirmSignIn.vue';
import AmplifyEventBus from '../src/events/AmplifyEventBus';
import { AmplifyPlugin } from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';
/* eslint-enable */

Vue.use(AmplifyPlugin, AmplifyMocks);

describe('ConfirmSignIn', () => {
  it('has a mounted hook', () => {
    expect(typeof ConfirmSignIn.mounted).toBe('function');
  });

  it('sets the correct default data', () => {
    expect(typeof ConfirmSignIn.data).toBe('function');
    const defaultData = ConfirmSignIn.data();
    expect(defaultData.code).toBe('');
    expect(defaultData.logger).toEqual({});
    expect(defaultData.error).toEqual('');
  });

  let wrapper;
  let header;
  const mockSend = jest.fn();
  const mockSubmit = jest.fn();
  const mockSignIn = jest.fn();
  const mockSetError = jest.fn();
  let testState;

  describe('...when it is mounted without props...', () => {
    beforeEach(() => {
      wrapper = shallowMount(ConfirmSignIn);
    });

    it('...it should use the amplify plugin with passed modules', () => {
      expect(wrapper.vm.$Amplify).toBeTruthy();
    });

    it('...it should be named ConfirmSignIn', () => {
      expect(wrapper.vm.$options.name).toEqual('ConfirmSignIn');
    });

    it('...it should instantiate a logger with the name of the component', () => {
      expect(wrapper.vm.logger.name).toEqual(wrapper.vm.$options.name);
    });

    it('...it should have an send method', () => {
      expect(wrapper.vm.send).toBeTruthy();
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
      expect(wrapper.vm.options.header).toEqual('Confirm Sign In');
      expect(Object.keys(wrapper.vm.options.user).length).toEqual(0);
    });

    it('...should set the error property when a valid user is not received', () => {
      expect(wrapper.vm.error).toEqual('Valid user not received.');
    });

    it('...should call Auth.verifyCurrentUserAttribute when send function is called', () => {
      wrapper.vm.send();
      expect(AmplifyMocks.Auth.verifyCurrentUserAttribute).toHaveBeenCalled();
    });

    it('...should call Auth.confirmSignIn when submit function is called', () => {
      wrapper.vm.submit();
      expect(AmplifyMocks.Auth.confirmSignIn).toHaveBeenCalled();
    });

    it('...should call emit the authState event when signIn function is called', () => {
      AmplifyEventBus.$on('authState', () => {
        testState = 'eventsAreEmitting';
      });
      expect(testState).toBeUndefined();
      wrapper.vm.signIn();
      expect(testState).toEqual('eventsAreEmitting');
    });
  });

  describe('...when it is mounted with props...', () => {
    beforeEach(() => {
      header = 'TestHeader';
      wrapper = shallowMount(ConfirmSignIn, {
        methods: {
          send: mockSend,
          submit: mockSubmit,
          signIn: mockSignIn,
          setError: mockSetError,
        },
        propsData: {
          confirmSignInConfig: {
            user: { username: 'TestPerson' },
            header,
          },
        },
      });
    });

    afterEach(() => {
      mockSend.mockReset();
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

    it('...should call send when send button is clicked', () => {
      const el = wrapper.find(`.${AmplifyUI.hint} > .${AmplifyUI.a}`);
      el.trigger('click');
      expect(mockSend).toHaveBeenCalled();
    });

    it('...should not call submit when submit button is clicked but code is not present', () => {
      const el = wrapper.find('button');
      el.trigger('click');
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('...should call submit when submit button is clicked and code is present', () => {
      const el = wrapper.find('button');
      wrapper.vm.code = 123456;
      el.trigger('click');
      expect(mockSubmit).toHaveBeenCalled();
    });

    it('...should call signIn when signIn button is clicked', () => {
      const el = wrapper.find(`.${AmplifyUI.sectionFooterSecondaryContent} > .${AmplifyUI.a}`);
      el.trigger('click');
      expect(mockSignIn).toHaveBeenCalled();
    });
  });
});
