/* eslint-disable */
import Vue from 'vue';
import { shallowMount, mount } from '@vue/test-utils';
import * as AmplifyUI from '@aws-amplify/ui';
import SignOut from '../src/components/authenticator/SignOut.vue';
import { AmplifyPlugin } from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';
/* eslint-enable */

Vue.use(AmplifyPlugin, AmplifyMocks);

describe('SignOut', () => {
  it('has a mounted hook', () => {
    expect(typeof SignOut.mounted).toBe('function');
  });

  it('sets the correct default data', () => {
    expect(typeof SignOut.data).toBe('function');
    const defaultData = SignOut.data();
    expect(defaultData.show).toBe(false);
    expect(defaultData.logger).toEqual({});
    expect(defaultData.error).toEqual('');
  });

  let wrapper;
  let msg;
  let signOutButton;
  const mockSignOut = jest.fn();
  const mockSetError = jest.fn();

  describe('...when it is mounted without props...', () => {
    beforeEach(() => {
      wrapper = shallowMount(SignOut);
    });

    it('...it should use the amplify plugin with passed modules', () => {
      expect(wrapper.vm.$Amplify).toBeTruthy();
    });

    it('...it should be named SignOut', () => {
      expect(wrapper.vm.$options.name).toEqual('SignOut');
    });

    it('...it should instantiate a logger with the name of the component', () => {
      expect(wrapper.vm.logger.name).toEqual(wrapper.vm.$options.name);
    });

    it('...it should have a signOut method', () => {
      expect(wrapper.vm.signOut).toBeTruthy();
    });

    it('...it should have a setError method', () => {
      expect(wrapper.vm.setError).toBeTruthy();
    });

    it('...have default options', () => {
      expect(wrapper.vm.options.msg).toEqual(null);
      expect(wrapper.vm.options.signOutButton).toEqual('Sign Out');
    });
  });

  describe('...when the methods are not mocked...', () => {
    wrapper = mount(SignOut);
    it('...should have a signOut method that calls Amplify.Auth.SignOut', () => {
      wrapper.vm.signOut();
      expect(wrapper.vm.$Amplify.Auth.signOut).toHaveBeenCalled();
    });
  });

  describe('...when it is mounted with props...', () => {
    beforeEach(() => {
      msg = 'Hello User';
      signOutButton = 'Get Outta Here';
      wrapper = shallowMount(SignOut, {
        methods: {
          signOut: mockSignOut,
          setError: mockSetError,
        },
        propsData: {
          signOutConfig: {
            msg,
            signOutButton,
          },
        },
      });
    });

    afterEach(() => {
      mockSignOut.mockReset();
      mockSetError.mockReset();
    });
    it('...should not set the error property', () => {
      expect(wrapper.vm.error).toEqual('');
      expect(mockSetError).not.toHaveBeenCalled();
    });

    it('...should render the msg from props', () => {
      const el = wrapper.find(`.${AmplifyUI.inputLabel}`).element;
      expect(el.textContent).toEqual(msg);
    });

    it('...should get the passed signOut button text', () => {
      const text = wrapper.find('button').text();
      expect(text).toEqual(signOutButton);
    });

    it('...should call SignOut when SignOut button is clicked', () => {
      const el = wrapper.find('button');
      el.trigger('click');
      expect(mockSignOut).toHaveBeenCalled();
    });
  });
});
