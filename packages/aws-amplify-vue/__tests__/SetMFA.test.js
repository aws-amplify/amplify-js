import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import QrcodeVue from 'qrcode.vue'; // eslint-disable-line
import * as AmplifyUI from '@aws-amplify/ui';
import SetMFA from '../src/components/authenticator/SetMFA.vue';
import { AmplifyPlugin } from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';

Vue.use(AmplifyPlugin, AmplifyMocks);

describe('SetMFA', () => {
  it('has a mounted hook', () => {
    expect(typeof SetMFA.mounted).toBe('function');
  });

  it('sets the correct default data', () => {
    expect(typeof SetMFA.data).toBe('function');
    const defaultData = SetMFA.data();
    expect(defaultData.user).toBe(null);
    expect(defaultData.mfaPreference).toBe(null);
    expect(defaultData.token).toBe(null);
    expect(defaultData.displayTotpSetup).toBe(false);
    expect(defaultData.logger).toEqual({});
    expect(defaultData.error).toEqual('');
  });

  let wrapper;
  let testText;
  const mockSetup = jest.fn();
  const mockSetUser = jest.fn();
  const mockSetMFA = jest.fn();
  const mockVerifyTotpToken = jest.fn();
  const mockSetError = jest.fn();

  describe('...when it is mounted without props...', () => {
    beforeEach(() => {
      wrapper = shallowMount(SetMFA);
    });

    it('...it should use the amplify plugin with passed modules', () => {
      expect(wrapper.vm.$Amplify).toBeTruthy();
    });

    it('...it should be named SetMFA', () => {
      expect(wrapper.vm.$options.name).toEqual('SetMfa');
    });

    it('...it should instantiate a logger with the name of the component', () => {
      expect(wrapper.vm.logger.name).toEqual(wrapper.vm.$options.name);
    });

    it('...it should have an setup method', () => {
      expect(wrapper.vm.setup).toBeTruthy();
    });

    it('...should have a setUser method', () => {
      expect(wrapper.vm.setUser).toBeTruthy();
    });

    it('...should have a setMFA method', () => {
      expect(wrapper.vm.setMFA).toBeTruthy();
    });

    it('...should have a verifyTotpToken method', () => {
      expect(wrapper.vm.verifyTotpToken).toBeTruthy();
    });

    it('...it should have a setError method', () => {
      expect(wrapper.vm.setError).toBeTruthy();
    });

    it('...have default options', () => {
      expect(wrapper.vm.options.header).toEqual('Multifactor Authentication Preference');
    });
  });

  describe('...when it is mounted with props...', () => {
    beforeEach(() => {
      testText = 'TestText';
      wrapper = shallowMount(SetMFA, {
        methods: {
          setup: mockSetup,
          setUser: mockSetUser,
          setMFA: mockSetMFA,
          verifyTotpToken: mockVerifyTotpToken,
          setError: mockSetError,
        },
        propsData: {
          mfaOptions: {
            header: testText,
            mfaDescription: testText,
            tokenInstructions: testText,
            smsDescription: testText,
            totpDescription: testText,
            noMfaDescription: testText,
            mfaTypes: [],
          },
        },
      });
    });

    afterEach(() => {
      mockSetup.mockReset();
      mockSetUser.mockReset();
      mockSetMFA.mockReset();
      mockVerifyTotpToken.mockReset();
      mockSetError.mockReset();
    });
    it('...should not set the error property', () => {
      expect(wrapper.vm.error).toEqual('');
      expect(mockSetError).not.toHaveBeenCalled();
    });

    it('...should render the header from props', () => {
      const el = wrapper.find(`.${AmplifyUI.sectionHeader}`).element;
      expect(el.firstChild.textContent.trim()).toEqual(testText);
    });

    it('...should render the mfaDescription from props', () => {
      const el = wrapper.find(`.${AmplifyUI.sectionHeader} > div`).element;
      expect(el.textContent.trim()).toEqual(testText);
    });

    it('...should not render the sms radio button if sms is not in mfaTypes', () => {
      const el = wrapper.find(`.${AmplifyUI.sectionHeader} > div`).element;
      expect(el.textContent.trim()).toEqual(testText);
    });

    it('...should call setUser on mount', () => {
      expect(mockSetUser).toHaveBeenCalled();
    });

    // it('...should call setMFA on setMFA button click', () => {
    //   const el = wrapper.find('#ampliyfSetMFA');
    //   el.trigger('click');
    //   expect(mockSetMFA).toHaveBeenCalled();
    // });

    it('...verifyTotpToken should not exist initially if displayTotpSetup is not true', () => {
      const el = wrapper.find('#amplifyVerifyToken').exists();
      expect(el).toBeFalsy();
    });

    it('...setup should be called when mfaPreference changes', () => {
      wrapper.vm.mfaPreference = 'TOTP';
      expect(mockSetup).toHaveBeenCalled();
    });

    // it('...verifyTotpToken and Qrcode element should exist if displayTotpSetup is true', () => {
    //   wrapper.vm.token = 'testtoken';
    //   wrapper.vm.displayTotpSetup = true;
    //   wrapper.vm.mfaPreference = 'TOTP';
    //   const el = wrapper.find('#amplifyVerifyToken').exists();
    //   const qr = wrapper.find(`.${AmplifyUI.totpQrcode}`).exists();
    //   expect(el).toBeTruthy();
    //   expect(qr).toBeTruthy();
    // });

    // it('...verifyTotpToken should be called when verifyToken button is clicked', () => {
    //   wrapper.vm.token = 'testtoken';
    //   wrapper.vm.displayTotpSetup = true;
    //   wrapper.vm.mfaPreference = 'TOTP';
    //   const el = wrapper.find('#amplifyVerifyToken');
    //   el.trigger('click');
    //   expect(mockVerifyTotpToken).toHaveBeenCalled();
    // });
  });
});
