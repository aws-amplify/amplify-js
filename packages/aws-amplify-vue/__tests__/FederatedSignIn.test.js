/* eslint-disable */
import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import FederatedSignIn from '../src/components/authenticator/FederatedSignIn.vue';
import AmplifyPlugin from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';
/* eslint-enable */

Vue.use(AmplifyPlugin, AmplifyMocks);
describe('FederatedSignIn', () => {
  it('has a mounted hook', () => {
    expect(typeof FederatedSignIn.mounted).toBe('function')
  });

  let wrapper;

  describe('...when it is mounted without props...', () => {
    beforeEach(() => {
      wrapper = shallowMount(FederatedSignIn);
    });

    it('...it should use the amplify plugin with passed modules', () => {
      expect(wrapper.vm.$Amplify).toBeTruthy();
    });

    it('...it should be named FederatedSignIn', () => {
      expect(wrapper.vm.$options.name).toEqual('FederatedSignIn');
    });

    it('...have default options', () => {
      expect(wrapper.vm.options.facebook_app_id).toEqual('');
      expect(wrapper.vm.options.amazon_client_id).toEqual('');
      expect(wrapper.vm.options.google_client_id).toEqual('');
    });
  })

  describe('...when it is mounted with props...', () => {
    beforeEach(() => {
      wrapper = shallowMount(FederatedSignIn, {
        propsData: {
          federatedSignInConfig: {
            facebook_app_id: 'test',
            google_client_id: 'test',
            amazon_client_id: 'test'
          },
        },
      });
    });

    it('...should render google button component', () => {
      expect(wrapper.find({name: 'GoogleButton'}).exists()).toBe(true)
    });

    it('...should render facebook button component', () => {
      expect(wrapper.find({name: 'FacebookButton'}).exists()).toBe(true)
    });

    it('...should render amazon button component', () => {
      expect(wrapper.find({name: 'AmazonButton'}).exists()).toBe(true)
    });
  })
})
