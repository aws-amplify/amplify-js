/* eslint-disable */
import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import * as AmplifyUI from '@aws-amplify/ui';
import AmplifyPlugin from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';
import GoogleButton from '../src/components/authenticator/Provider/GoogleButton.vue';
import FacebookButton from '../src/components/authenticator/Provider/FacebookButton.vue';
import AmazonButton from '../src/components/authenticator/Provider/AmazonButton.vue';
/* eslint-enable */

Vue.use(AmplifyPlugin, AmplifyMocks);

describe('GoogleButton', () => {
  it('has a mounted hook', () => {
    expect(typeof GoogleButton.mounted).toBe('function');
  });

  it('has a created hook', () => {
    expect(typeof GoogleButton.created).toBe('function');
  });

  let wrapper;
  const mockSignIn = jest.fn();
  const mockInitGapi = jest.fn();
  const mockCreateScript = jest.fn();
  const mockFederatedSignIn = jest.fn();

  describe('...when it is mounted with props...', () => {
    beforeEach(() => {
      wrapper = shallowMount(GoogleButton, {
        methods: {
          initGapi: mockInitGapi,
          signIn: mockSignIn,
        },
        propsData: {
          google_client_id: 'test'
        },
      });
    });

    afterEach(() => {
      mockSignIn.mockReset();
      mockInitGapi.mockReset();
    });

    it('...it should use the amplify plugin with passed modules', () => {
      expect(wrapper.vm.$Amplify).toBeTruthy();
    });

    it('...it should be named GoogleButton', () => {
      expect(wrapper.vm.$options.name).toEqual('GoogleButton');
    });

    it('...it should instantiate a logger with the name of the component', () => {
      expect(wrapper.vm.logger.name).toEqual(wrapper.vm.$options.name);
    });

    it('...it should have a signIn method', () => {
      expect(wrapper.vm.signIn).toBeTruthy();
    });

    it('...it should have a createScript method', () => {
      expect(wrapper.vm.createScript).toBeTruthy();
    });

    it('...it should have a initGapi method', () => {
      expect(wrapper.vm.initGapi).toBeTruthy();
    });

    it('...it should have a federatedSignIn method', () => {
      expect(wrapper.vm.federatedSignIn).toBeTruthy();
    });

    it('...have default options', () => {
      expect(wrapper.props('google_client_id')).toEqual('test');
    });

    it('...should render the button', () => {
      const el = wrapper.find(`#${AmplifyUI.googleSignInButton}`).element;
      expect(el.textContent).toContain('i18n Sign In with Google');
    });

    it('...should call signIn when signInbutton is clicked', () => {
      const el = wrapper.find(`#${AmplifyUI.googleSignInButton}`);
      el.trigger('click');
      expect(mockSignIn).toHaveBeenCalled();
    });
  })
})

describe('FacebookButton', () => {
  it('has a mounted hook', () => {
    expect(typeof FacebookButton.mounted).toBe('function');
  });

  it('has a created hook', () => {
    expect(typeof FacebookButton.created).toBe('function');
  });

  let wrapper;
  const mockInitFB = jest.fn();
  const mockFbAsyncInit = jest.fn();
  const mockSignIn = jest.fn();
  const mockCreateScript = jest.fn();
  const mockFederatedSignIn = jest.fn();

  describe('...when it is mounted with props...', () => {
    beforeEach(() => {
      wrapper = shallowMount(FacebookButton, {
        methods: {
          signIn: mockSignIn,
          initFB: mockInitFB
        },
        propsData: {
          facebook_app_id: 'test'
        },
      });
    });
    afterEach(() => {
      mockSignIn.mockReset();
      mockInitFB.mockReset();
    });

    it('...it should use the amplify plugin with passed modules', () => {
      expect(wrapper.vm.$Amplify).toBeTruthy();
    });

    it('...it should be named FacebookButton', () => {
      expect(wrapper.vm.$options.name).toEqual('FacebookButton');
    });

    it('...it should instantiate a logger with the name of the component', () => {
      expect(wrapper.vm.logger.name).toEqual(wrapper.vm.$options.name);
    });

    it('...it should have a signIn method', () => {
      expect(wrapper.vm.signIn).toBeTruthy();
    });

    it('...it should have a createScript method', () => {
      expect(wrapper.vm.createScript).toBeTruthy();
    });

    it('...it should have a initFB method', () => {
      expect(wrapper.vm.initFB).toBeTruthy();
    });

    it('...it should have a fbAsyncInit method', () => {
      expect(wrapper.vm.fbAsyncInit).toBeTruthy();
    });

    it('...it should have a federatedSignIn method', () => {
      expect(wrapper.vm.federatedSignIn).toBeTruthy();
    });

    it('...have default props', () => {
      expect(wrapper.props('facebook_app_id')).toEqual('test');
    });

    it('...should render the button', () => {
      const el = wrapper.find(`#${AmplifyUI.facebookSignInButton}`).element;
      expect(el.textContent).toContain('i18n Sign In with Facebook');
    });

    it('...should call signIn when signInbutton is clicked', () => {
      const el = wrapper.find(`#${AmplifyUI.facebookSignInButton}`);
      el.trigger('click');
      expect(mockSignIn).toHaveBeenCalled();
    });
  })
})

describe('AmazonButton', () => {
  it('has a mounted hook', () => {
    expect(typeof AmazonButton.mounted).toBe('function');
  });

  it('has a created hook', () => {
    expect(typeof AmazonButton.created).toBe('function');
  });

  let wrapper;
  const mockInitAmazon = jest.fn();
  const mockSignIn = jest.fn();
  const mockCreateScript = jest.fn();
  const mockFederatedSignIn = jest.fn();

  describe('...when it is mounted with props...', () => {
    beforeEach(() => {
      wrapper = shallowMount(AmazonButton, {
        methods: {
          signIn: mockSignIn,
          initAmazon: mockInitAmazon
        },
        propsData: {
          amazon_client_id: 'test'
        },
      });
    });

    afterEach(() => {
      mockSignIn.mockReset();
      mockInitAmazon.mockReset();
    });
  
    it('...it should use the amplify plugin with passed modules', () => {
      expect(wrapper.vm.$Amplify).toBeTruthy();
    });
  
    it('...it should be named AmazonButton', () => {
      expect(wrapper.vm.$options.name).toEqual('AmazonButton');
    });
  
    it('...it should instantiate a logger with the name of the component', () => {
      expect(wrapper.vm.logger.name).toEqual(wrapper.vm.$options.name);
    });
  
    it('...it should have a signIn method', () => {
      expect(wrapper.vm.signIn).toBeTruthy();
    });
  
    it('...it should have a createScript method', () => {
      expect(wrapper.vm.createScript).toBeTruthy();
    });
  
    it('...it should have a initAmazon method', () => {
      expect(wrapper.vm.initAmazon).toBeTruthy();
    });
  
    it('...it should have a federatedSignIn method', () => {
      expect(wrapper.vm.federatedSignIn).toBeTruthy();
    });
  
    it('...have default props', () => {
      expect(wrapper.props('amazon_client_id')).toEqual('test');
    });
  
    it('...should render the button', () => {
      const el = wrapper.find(`#${AmplifyUI.amazonSignInButton}`).element;
      expect(el.textContent).toContain('i18n Sign In with Amazon');
    });
  
    it('...should call signIn when signInbutton is clicked', () => {
      const el = wrapper.find(`#${AmplifyUI.amazonSignInButton}`);
      el.trigger('click');
      expect(mockSignIn).toHaveBeenCalled();
    });
  });
})
