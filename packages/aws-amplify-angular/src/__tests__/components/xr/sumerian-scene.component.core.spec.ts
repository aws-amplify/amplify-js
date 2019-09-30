import { AmplifyService } from '../../../providers/amplify.service';
import { SumerianSceneComponentCore } from '../../../components/xr/sumerian-scene-component/sumerian-scene.component.core';
import Amplify from 'aws-amplify';

describe('SumerianSceneComponentCore: ', () => {
	let component: SumerianSceneComponentCore;
	let service: AmplifyService;

	beforeEach(() => {
		service = new AmplifyService(Amplify);
		component = new SumerianSceneComponentCore(service);
	});

	afterEach(() => {
		service = null;
		component = null;
	});

	it('...should be created', () => {
		expect(component).toBeTruthy();
	});

	it('...should have a enterVR method', () => {
		expect(component.toggleVRPresentation).toBeTruthy();
	});

	it('...should have an loadAndStartScene method', () => {
		expect(component.loadAndStartScene).toBeTruthy();
	});

	it('...should have an maximize method', () => {
		expect(component.maximize).toBeTruthy();
	});

	it('...should have an minimize method', () => {
		expect(component.minimize).toBeTruthy();
	});

	it('...should have an setMuted method', () => {
		expect(component.setMuted).toBeTruthy();
	});

	it('...should have an onFullscreenChange method', () => {
		expect(component.onFullscreenChange).toBeTruthy();
	});
});
