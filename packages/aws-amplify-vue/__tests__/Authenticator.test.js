import Vue from 'vue';
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
    let vm;

    beforeEach(() => {
      vm = new Vue(Authenticator).$mount();
      vm.setUser = jest.fn();
    });

    it('...it should use the amplify plugin with passed modules', () => {
      expect(vm.$Amplify).toBeTruthy();
    });

    it('...it should be named Authenticator', () => {
      expect(vm.$options.name).toEqual('Authenticator');
    });

    it('...it should instantiate a logger with the name of the component', () => {
      expect(vm.logger.name).toEqual(vm.$options.name);
    });

    it('...it should have an updateDisplayMap method', () => {
      expect(vm.updateDisplayMap).toBeTruthy();
    });

    it('...it should have a setError method', () => {
      expect(vm.setError).toBeTruthy();
    });
  });
});
