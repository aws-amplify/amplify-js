/* eslint-disable */
import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import * as AmplifyUI from '@aws-amplify/ui';
import SignUp from '../src/components/authenticator/SignUp.vue';
import countries from '../src/assets/countries';
import { AmplifyPlugin } from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';
/* eslint-enable */

Vue.use(AmplifyPlugin, AmplifyMocks);

describe('SignUp', () => {
  it('has a mounted hook', () => {
    expect(typeof SignUp.mounted).toBe('function');
  });

  it('sets the correct default data', () => {
    expect(typeof SignUp.data).toBe('function');
    const defaultData = SignUp.data();
    expect(defaultData.country).toEqual('USA (+1)');
    expect(defaultData.countryCode).toEqual('1');
    expect(defaultData.countries).toEqual(countries);
    expect(defaultData.logger).toEqual({});
    expect(defaultData.error).toEqual('');
  });

  let wrapper;
  let header;
  const mockSignUp = jest.fn();
  const mockValidate = jest.fn();
  const mockSignIn = jest.fn();
  const mockClear = jest.fn();
  const mockSetError = jest.fn();

  describe('...when it is mounted without props...', () => {
    beforeEach(() => {
      wrapper = shallowMount(SignUp);
    });

    it('...it should use the amplify plugin with passed modules', () => {
      expect(wrapper.vm.$Amplify).toBeTruthy();
    });

    it('...it should be named SignUp', () => {
      expect(wrapper.vm.$options.name).toEqual('SignUp');
    });

    it('...it should instantiate a logger with the name of the component', () => {
      expect(wrapper.vm.logger.name).toEqual(wrapper.vm.$options.name);
    });

    it('...it should have a signIn method', () => {
      expect(wrapper.vm.signIn).toBeTruthy();
    });

    it('...should have a validate method', () => {
      expect(wrapper.vm.validate).toBeTruthy();
    });

    it('...should have a signUp method', () => {
      expect(wrapper.vm.signUp).toBeTruthy();
    });

    it('...should have a clear method', () => {
      expect(wrapper.vm.clear).toBeTruthy();
    });

    it('...it should have a setError method', () => {
      expect(wrapper.vm.setError).toBeTruthy();
    });

    it('...it should watch the country variable', () => {
      wrapper.vm.country = 'Algeria (+213)';
      expect(wrapper.vm.countryCode).toEqual('213');
    });

    it('...have default options', () => {
      expect(wrapper.vm.options.header).toEqual('Sign Up');
      expect(wrapper.vm.options.signUpFields).toEqual([
        {
          label: 'Username',
          key: 'username',
          required: true,
          type: 'string',
          displayOrder: 1,
        },
        {
          label: 'Password',
          key: 'password',
          required: true,
          type: 'password',
          displayOrder: 2,
        },
        {
          label: 'Email',
          key: 'email',
          required: true,
          type: 'string',
          displayOrder: 3,
        },
        {
          label: 'Phone Number',
          key: 'phone_number',
          required: true,
          displayOrder: 4,
        },
      ]);
    });

    it('...it should not call Auth.signUp when signUp method is called and fields are empty', () => { // eslint-disable-line
      wrapper.vm.signUp();
      expect(wrapper.vm.$Amplify.Auth.signUp).not.toBeCalled();
    });

    it('...it should call Auth.signUp when signUp method is called and fields are populated', () => { // eslint-disable-line
      wrapper.vm.options.signUpFields.forEach((el) => {
        el.value = 'iampopulated';
      });
      wrapper.vm.signUp();
      expect(wrapper.vm.$Amplify.Auth.signUp).toBeCalled();
    });
  });

  describe('...when it is mounted with props...', () => {
    let signUpFields = [];
    beforeEach(() => {
      header = 'TestHeader';
      wrapper = shallowMount(SignUp, {
        methods: {
          signIn: mockSignIn,
          validate: mockValidate,
          signUp: mockSignUp,
          setError: mockSetError,
          clear: mockClear,
        },
        propsData: {
          signUpConfig: {
            header,
            signUpFields,
          },
        },
      });
    });

    afterEach(() => {
      mockSignUp.mockReset();
      mockValidate.mockReset();
      mockSignIn.mockReset();
      mockClear.mockReset();
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
      const el = wrapper.find(`.${AmplifyUI.sectionFooterPrimaryContent} > button`);
      el.trigger('click');
      expect(mockSignUp).toHaveBeenCalled();
    });

    it('...should keep default signUpFields if passed fields are empty array', () => {
      signUpFields = [];
      expect(wrapper.vm.options.signUpFields.length).toEqual(4);
    });
  });

  describe('...when signUpFields are passed...', () => {
    const signUpFields = [
      {
        label: 'Address',
        key: 'address',
        required: true,
        type: 'string',
      },
      {
        label: 'Test Email',
        key: 'email',
        required: true,
        type: 'string',
      },
    ];
    beforeEach(() => {
      header = 'TestHeader';
      wrapper = shallowMount(SignUp, {
        methods: {
          signIn: mockSignIn,
          validate: mockValidate,
          signUp: mockSignUp,
          setError: mockSetError,
          clear: mockClear,
        },
        propsData: {
          signUpConfig: {
            header,
            signUpFields,
          },
        },
      });
    });

    afterEach(() => {
      mockSignUp.mockReset();
      mockValidate.mockReset();
      mockSignIn.mockReset();
      mockClear.mockReset();
      mockSetError.mockReset();
    });

    it('...should accept new signUpFields an add them to the default Array', () => {
      expect(wrapper.vm.options.signUpFields.length).toEqual(5);
    });

    it('...should overwrite existing fields from default array', () => {
      const email = wrapper.vm.options.signUpFields.find(x => x.key === 'email');
      expect(email.label).toEqual('Test Email');
    });
  });
});
