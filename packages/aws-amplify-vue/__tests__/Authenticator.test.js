import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import Authenticator from '../src/components/authenticator/Authenticator.vue';
import { AmplifyPlugin } from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';

Vue.use(AmplifyPlugin, AmplifyMocks);

describe('Authenticator', () => {
  it('has a mounted hook', () => {
    expect(typeof Authenticator.mounted).toBe('function');
  });

  it('sets the correct default data', () => {
    expect(typeof Authenticator.data).toBe('function');
    const defaultData = Authenticator.data();
    expect(defaultData.user.username).toBe(null);
    expect(defaultData.logger).toEqual({});
    expect(defaultData.displayMap).toEqual({});
    expect(defaultData.error).toEqual('');
  });

  describe('...when it is mounted...', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(Authenticator);
      wrapper.vm.setUser = jest.fn();
    });

    it('...it should use the amplify plugin with passed modules', () => {
      expect(wrapper.vm.$Amplify).toBeTruthy();
    });

    it('...it should be named Authenticator', () => {
      expect(wrapper.vm.$options.name).toEqual('Authenticator');
    });

    it('...it should instantiate a logger with the name of the component', () => {
      expect(wrapper.vm.logger.name).toEqual(wrapper.vm.$options.name);
    });

    it('...it should have an updateDisplayMap method', () => {
      expect(wrapper.vm.updateDisplayMap).toBeTruthy();
    });

    it('...it should have a setError method', () => {
      expect(wrapper.vm.setError).toBeTruthy();
    });
    // it('...the signup component should be visible be default', () => {
    //   const el = wrapper.find('#signIn').exists();
    //   expect(el).toBeTruthy();
    // })

  })

});
