/* eslint-disable */
import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import Connect from '../src/components/api/graphql/Connect.vue';
import { AmplifyPlugin } from '../src/plugins/AmplifyPlugin';
import * as AmplifyMocks from '../__mocks__/Amplify.mocks';
/* eslint-enable */

Vue.use(AmplifyPlugin, AmplifyMocks);

describe('Connect', () => {
  it('has a mounted hook', () => {
    expect(typeof Connect.mounted).toBe('function');
  });

  it('sets the correct default data', () => {
    expect(typeof Connect.data).toBe('function');
    const defaultData = Connect.data();
    expect(defaultData.data).toEqual({});
    expect(defaultData.logger).toEqual({});
    expect(defaultData.errors).toEqual([]);
    expect(defaultData.loading).toEqual(false);
    expect(defaultData.watchedSubscription).toEqual(null);
    expect(defaultData.isMutation).toEqual(false);
    expect(defaultData.internalMutation).toEqual(null);
  });
});