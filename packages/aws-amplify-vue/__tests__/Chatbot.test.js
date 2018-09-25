/* eslint-disable */
import Vue from 'vue';
import { shallowMount, mount } from '@vue/test-utils';
import * as AmplifyUI from '@aws-amplify/ui';
import Chatbot from '../src/components/interactions/Chatbot.vue';
import AmplifyEventBus from '../src/events/AmplifyEventBus';
import { AmplifyPlugin } from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';
/* eslint-enable */

Vue.use(AmplifyPlugin, AmplifyMocks);

describe('Chatbot', () => {
  it('has a mounted hook', () => {
    expect(typeof Chatbot.mounted).toBe('function');
  });

  it('sets the correct default data', () => {
    expect(typeof Chatbot.data).toBe('function');
    const defaultData = Chatbot.data();
    expect(defaultData.inputText).toBe('');
    expect(defaultData.messages.length).toEqual(0);
    expect(defaultData.logger).toEqual({});
    expect(defaultData.error).toEqual('');
  });

  let wrapper;
  let testState;
  const mockPerformOnComplete = jest.fn();
  const mockKeymonitor = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockSetError = jest.fn();

  describe('...when it is mounted without props...', () => {
    beforeEach(() => {
      wrapper = shallowMount(Chatbot);
      testState = null;
    });

    it('...it should use the amplify plugin with passed modules', () => {
      expect(wrapper.vm.$Amplify).toBeTruthy();
    });

    it('...it should be named Chatbot', () => {
      expect(wrapper.vm.$options.name).toEqual('Chatbot');
    });

    it('...it should instantiate a logger with the name of the component', () => {
      expect(wrapper.vm.logger.name).toEqual(wrapper.vm.$options.name);
    });

    it('...it should have a performOnComplete method', () => {
      expect(wrapper.vm.performOnComplete).toBeTruthy();
    });

    it('...it should have a keymonitor method', () => {
      expect(wrapper.vm.keymonitor).toBeTruthy();
    });

    it('...it should have an onSubmit method', () => {
      expect(wrapper.vm.onSubmit).toBeTruthy();
    });

    it('...it should have a setError method', () => {
      expect(wrapper.vm.setError).toBeTruthy();
    });

    it('...have default options', () => {
      expect(wrapper.vm.options.clearComplete).toEqual(true);
      expect(wrapper.vm.options.botTitle).toEqual('Chatbot');
    });

    it('...should return immediately when onSubmit is called without inputText', () => {
      wrapper.vm.onSubmit({});
      expect(wrapper.vm.$Amplify.Interactions.send).not.toHaveBeenCalled();
    });

    it('...should call $Amplify.Interactions.send when onSubmit is called with inputText', () => {
      wrapper.vm.inputText = 'i exist';
      wrapper.vm.onSubmit({});
      expect(wrapper.vm.$Amplify.Interactions.send).toHaveBeenCalled();
    });

    it('...should emit chatComplete when performOnComplete method called', () => {
      testState = 0;
      AmplifyEventBus.$on('chatComplete', (val) => {
        if (val === wrapper.vm.options.botTitle) {
          testState = 3;
        }
      });
      wrapper.vm.performOnComplete();
      expect(testState).toEqual(3);
    });

    it('...should emit clear messages when performOnComplete method and clearComplete is true', () => { // eslint-disable-line
      wrapper.vm.messages = ['messages'];
      wrapper.vm.performOnComplete();
      expect(wrapper.vm.messages).toEqual([]);
    });
  });

  describe('...when only onSubmit is mocked', () => {
    let botTitle;
    let clearComplete;
    let bot;
    beforeEach(() => {
      botTitle = 'TestBot';
      clearComplete = 'Get Outta Here';
      bot = 'TestBotName';
      wrapper = shallowMount(Chatbot, {
        methods: {
          onSubmit: mockOnSubmit,
        },
        propsData: {
          chatbotConfig: {
            botTitle,
            clearComplete,
            bot,
          },
        },
      });
    });

    afterEach(() => {
      mockOnSubmit.mockReset();
    });

    it('...should not call onSubmit when keymonitor is called with key other than Enter', () => {
      wrapper.vm.keymonitor({ key: 'r' });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('...should call onSubmit when keymonitor is called with Enter', () => {
      wrapper.vm.keymonitor({ key: 'enter' });
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe('...when it is mounted with props...', () => {
    let botTitle;
    let clearComplete;
    let bot;
    beforeEach(() => {
      botTitle = 'TestBot';
      clearComplete = 'Get Outta Here';
      bot = 'TestBotName';
      wrapper = shallowMount(Chatbot, {
        methods: {
          performOnComplete: mockPerformOnComplete,
          keymonitor: mockKeymonitor,
          onSubmit: mockOnSubmit,
          setError: mockSetError,
        },
        propsData: {
          chatbotConfig: {
            botTitle,
            clearComplete,
            bot,
          },
        },
      });
    });

    afterEach(() => {
      mockPerformOnComplete.mockReset();
      mockKeymonitor.mockReset();
      mockSetError.mockReset();
      mockOnSubmit.mockReset();
    });

    it('...should not set the error property', () => {
      expect(wrapper.vm.error).toEqual('');
      expect(mockSetError).not.toHaveBeenCalled();
    });

    it('...should call onSubmit with inputText when submit button is clicked', () => {
      const el = wrapper.find('button');
      wrapper.vm.inputText = 'talk to me, robot';
      el.trigger('click');
      expect(mockOnSubmit).toHaveBeenCalledWith('talk to me, robot');
    });

    it('...should call keymonitor when key events occur in input', () => {
      const input = wrapper.find('.amplify-interactions-actions > input');
      input.trigger('keyup', { keyCode: 40 });
      expect(mockKeymonitor).toHaveBeenCalled();
    });
  });
});
