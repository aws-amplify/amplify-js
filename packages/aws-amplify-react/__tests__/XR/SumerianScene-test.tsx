import * as React from 'react';
import { SumerianScene } from '../../src/XR/SumerianScene';
import { XR } from '@aws-amplify/xr';

const sceneConfig = {};
XR.configure({
	region: 'us-east-1',
	scenes: {
		TestSceneName: {
			// Friendly scene name
			sceneConfig: sceneConfig, // Scene configuration from Sumerian publish
		},
	},
});

describe('SumerianScene', () => {
	test('renders successfully', () => {
		const wrapper = mount(<SumerianScene sceneName="TestSceneName" />);
		expect(wrapper).toMatchSnapshot();
	});

	test('loadAndSetupScene is called when component is mounted', () => {
		const spy = jest.spyOn(SumerianScene.prototype, 'loadAndSetupScene');
		mount(<SumerianScene sceneName="TestSceneName" />);
		expect(spy).toHaveBeenCalled();
	});

	test('loadScene from XR module is called when component is mounted', () => {
		const spy = jest.spyOn(XR, 'loadScene');
		shallow(<SumerianScene sceneName="TestSceneName" />);
		expect(spy).toHaveBeenCalled();
	});
});
