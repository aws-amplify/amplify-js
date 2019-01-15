/* eslint-disable */
import Vue from 'vue';
import { shallowMount, mount } from '@vue/test-utils';
import * as AmplifyUI from '@aws-amplify/ui';
import VerifyContact from '../src/components/authenticator/VerifyContact.vue';
import AmplifyPlugin from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';
/* eslint-enable */

Vue.use(AmplifyPlugin, AmplifyMocks);

describe('VerifyContact', () => {
  it('has a mounted hook', () => {
    expect(typeof VerifyContact.mounted).toBe('function');
  });


  let wrapper;
  let verificationMessage;
  let user;
  const mockVerify = jest.fn();
  const mockSubmit = jest.fn();
  const mockSkip = jest.fn();
  const mockSetError = jest.fn();

  describe('...when it is mounted without props...', () => {
    beforeEach(() => {
      wrapper = shallowMount(VerifyContact);
    });

    it('...it should use the amplify plugin with passed modules', () => {
      expect(wrapper.vm.$Amplify).toBeTruthy();
    });

    it('...it should be named VerifyContact', () => {
      expect(wrapper.vm.$options.name).toEqual('VerifyContact');
    });

    it('...it should instantiate a logger with the name of the component', () => {
      expect(wrapper.vm.logger.name).toEqual(wrapper.vm.$options.name);
    });

    it('...it should have a verify method', () => {
      expect(wrapper.vm.verify).toBeTruthy();
    });

    it('...it should have a submit method', () => {
      expect(wrapper.vm.submit).toBeTruthy();
    });

    it('...it should have a setError method', () => {
      expect(wrapper.vm.setError).toBeTruthy();
    });

    it('...it should have a skip method', () => {
      expect(wrapper.vm.skip).toBeTruthy();
    });
  });

  describe('...when it is mounted with props...', () => {
    beforeEach(() => {
      verificationMessage = 'Hello User';
      user = {
        unverified: {
          phone_number: '123',
          email: 'test@test.test'
        }
      }
      wrapper = shallowMount(VerifyContact, {
        methods: {
          verify: mockVerify,
          setError: mockSetError,
        },
        propsData: {
          verifyContactConfig: {
            verificationMessage,
            user
          },
        },
      });
    });

    afterEach(() => {
      mockVerify.mockReset();
      mockSetError.mockReset();
    });
    it('...should not set the error property', () => {
      expect(wrapper.vm.error).toEqual('');
      expect(mockSetError).not.toHaveBeenCalled();
    });

    it('...should render the verificationMessage from props', () => {
      const el = wrapper.find(`.${AmplifyUI.hint}`).element;
      expect(el.textContent.trim()).toEqual(verificationMessage);
    });

    it('...should call verify when verify button is clicked', () => {
      const el = wrapper.find('button');
      el.trigger('click');
      expect(mockVerify).toHaveBeenCalled();
    });


    it('...should not show phone number radio by default', () => {
      const el = wrapper.text().toLowerCase();
      expect(el.includes('phone')).toBeFalsy();
    });
  });
});
