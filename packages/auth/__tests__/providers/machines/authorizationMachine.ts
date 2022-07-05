import { interpret } from 'xstate';
import { done } from 'xstate/lib/actions';
import {
	authzMachine,
	authzMachineEvents,
} from '../../../src/Providers/CognitoProvider/machines/authorizationMachine';
import { CognitoService } from '../../../src/Providers/CognitoProvider/service';
import { CognitoProviderConfig } from '../../../src/Providers/CognitoProvider/CognitoProvider';

// what is the initial state ?
// does configure work?
// does fetchAuthSession actor gets spawned? when?
// does it transition to error state?
// (not sure how to test this yet) can we mock the fetchAuthSessionMachine and test the invoke function?

const testCognitoProviderConfig: CognitoProviderConfig = {
	userPoolId: 'userPoolId',
	region: 'us-west-2',
	clientId: 'clientId',
	identityPoolId: 'identityPoolId',
};

describe('Authorization Machine Test', () => {
	const _authzService = interpret(authzMachine);
	_authzService.start();

	test('start machine test', () => {
		expect(_authzService).toBeTruthy();
		expect(_authzService).toBeDefined();
		expect(_authzService.state.matches('notConfigured'));
	});

	// test('config and service test', done => {
	// 	_authzService.onTransition(state => {
	// 		if (state.matches('configured')) {
	// 			expect(state.context.service).toBeInstanceOf(CognitoService);
	// 			expect(state.context.config).toStrictEqual(testCognitoProviderConfig);
	// 			done();
	// 		}
	// 	});
	// });
});
